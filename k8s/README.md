# k8s

This directory handles kubernetes setup.

## Getting Started

```bash
init.sh # this
helmfile apply
```

## Note

Currently, knative does not have helm chart. I personally tried some declarative setup of Knative with gloo (without Istio), but only succeeded with `glooctl install knative`. Even making helm chart based on `glooctl install knative --dry-run` didn't work (pods status Crash) (I of course splitted crds from it to crds directory in the chart). That's way init.sh imp
