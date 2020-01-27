cluster:
	kind create cluster --config kind.config.yaml

cluster-mk:
	minikube start --memory=4000 --cpus=3 --disk-size='60000mb' \
	--vm-driver=virtualbox \
	--extra-config=apiserver.enable-admission-plugins="LimitRanger,NamespaceExists,NamespaceLifecycle,ResourceQuota,ServiceAccount,DefaultStorageClass,MutatingAdmissionWebhook"

init:
	make cluster
	make dev

dev:
	make dev-istio
	make knative
	make apply

kantive-istio:
	istioctl manifest apply \
	--set values.prometheus.enabled=false \
	--set values.mixer.policy.enabled=false \
	--set values.mixer.telemetry.enabled=false \
	--set values.pilot.sidecar=false \
	--set values.pilot.resources.requests.memory=128Mi \
	--set values.galley.enabled=false \
	--set values.global.useMCP=false \
	--set values.security.enabled=false \
	--set values.global.disablePolicyChecks=true \
	--set values.sidecarInjectorWebhook.enabled=false \
	--set values.global.proxy.autoInject=disabled \
	--set values.global.omitSidecarInjectorConfigMap=true \
	--set values.gateways.istio-ingressgateway.autoscaleMin=1 \
	--set values.gateways.istio-ingressgateway.autoscaleMax=2 \
	--set values.pilot.traceSampling=100 \
	--set values.gateways.istio-ingressgateway.type=NodePort

dev-istio:
	istioctl manifest apply \
	--set profile=minimal \
	--set gateways.enabled=true \
	--set values.prometheus.enabled=false \
	--set values.kiali.enabled=false \
	--set values.grafana.enabled=false \
	--set values.tracing.enabled=false \
	--set values.gateways.istio-ingressgateway.type=NodePort

knative:
	kubectl apply --selector knative.dev/crd-install=true \
	--filename https://github.com/knative/serving/releases/download/v0.11.1/serving.yaml
	kubectl apply \
	--filename https://github.com/knative/serving/releases/download/v0.11.1/serving.yaml

dev-apply:
	dotenv -e ../.env.k8s.local -- helmfile apply

dev-destroy:
	dotenv -e ../.env.k8s.local -- helmfile destroy

ci-apply:
	dotenv -e ../.env.k8s.local -- helmfile apply --suppress-secrets

prod-istio:
	istioctl manifest apply \
	--set values.sidecarInjectorWebhook.enabled=true \
	--set values.sidecarInjectorWebhook.enableNamespacesByDefault=true \
	--set values.global.proxy.autoInject=disabled \
	--set values.global.disablePolicyChecks=true \
	--set values.prometheus.enabled=false \
	`# Disable mixer prometheus adapter to remove istio default metrics.` \
	--set values.mixer.adapters.prometheus.enabled=false \
	`# Disable mixer policy check, since in our template we set no policy.` \
	--set values.global.disablePolicyChecks=true \
	--set values.gateways.istio-ingressgateway.autoscaleMin=1 \
	--set values.gateways.istio-ingressgateway.autoscaleMax=2 \
	--set values.gateways.istio-ingressgateway.resources.requests.cpu=500m \
	--set values.gateways.istio-ingressgateway.resources.requests.memory=256Mi \
	`# More pilot replicas for better scale` \
	--set values.pilot.autoscaleMin=2 \
	`# Set pilot trace sampling to 100%` \
	--set values.pilot.traceSampling=100

prod:
	make prod-istio
	make knative
	make apply -f helmfile.prod.yaml
