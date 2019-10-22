import * as vscode from 'vscode';
import * as k8s from 'vscode-kubernetes-tools-api';

import { MICROK8S_CLOUD_PROVIDER } from './microk8s-cloud-provider';

export async function activate(_context: vscode.ExtensionContext) {
    const cloudExplorer = await k8s.extension.cloudExplorer.v1;
    if (cloudExplorer.available) {
        cloudExplorer.api.registerCloudProvider(MICROK8S_CLOUD_PROVIDER);
    } else {
        vscode.window.showErrorMessage("Can't register Microk8s cloud provider: " + cloudExplorer.reason);
    }

    // const disposables = [];

	// context.subscriptions.push(...disposables);
}
