// Copyright 2016-2018, Pulumi Corporation.  All rights reserved.

import * as gcp from '@pulumi/gcp'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import { nodeCount, nodeMachineType, password, username } from './config'

// Create the GKE cluster and export it.
export const k8sCluster = new gcp.container.Cluster('primary', {
  initialNodeCount: nodeCount,
  // masterAuth: { username, password },
  nodeConfig: {
    machineType: nodeMachineType,
    oauthScopes: [
      'https://www.googleapis.com/auth/compute',
      'https://www.googleapis.com/auth/devstorage.read_only',
      'https://www.googleapis.com/auth/logging.write',
      'https://www.googleapis.com/auth/monitoring',
    ],
  },
})

// Manufacture a GKE-style Kubeconfig. Note that this is slightly "different" because of the way GKE requires
// gcloud to be in the picture for cluster authentication (rather than using the client cert/key directly).
export const k8sConfig = pulumi
  .all([k8sCluster.name, k8sCluster.endpoint, k8sCluster.masterAuth])
  .apply(([name, endpoint, auth]) => {
    const context = `${gcp.config.project}_${gcp.config.zone}_${name}`
    return `
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${auth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`
  })

// Export a Kubernetes provider instance that uses our cluster from above.
export const k8sProvider = new k8s.Provider('gkeK8s', {
  kubeconfig: k8sConfig,
})
