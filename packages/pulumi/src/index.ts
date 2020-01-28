// Copyright 2016-2018, Pulumi Corporation.  All rights reserved.

import { k8sConfig, k8sProvider } from './cluster'

// Export the Kubeconfig so that clients can easily access our cluster.
export const kubeConfig = k8sConfig
