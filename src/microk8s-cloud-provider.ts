import * as vscode from 'vscode';
import * as k8s from 'vscode-kubernetes-tools-api';

import * as microk8s from './microk8s/microk8s';
import { failed } from './utils/errorable';
import { shell } from './utils/shell';

class Microk8sCloudProvider implements k8s.CloudExplorerV1.CloudProvider {
    readonly cloudName = "Microk8s";
    readonly treeDataProvider = new Microk8sTreeDataProvider();
    async getKubeconfigYaml(cluster: any): Promise<string | undefined> {
        const treeNode = cluster as Microk8sCloudProviderTreeNode;
        if (treeNode.nodeType === 'cluster') {
            return await getMicrok8sKubeconfigYaml();
        }
        return undefined;
    }
}

export interface Microk8sClusterNode {
    readonly nodeType: 'cluster';
}

export interface Microk8sErrorNode {
    readonly nodeType: 'error';
    readonly diagnostic: string;
}

// TODO: the actual type
export type Microk8sCloudProviderTreeNode = Microk8sClusterNode | Microk8sErrorNode;

class Microk8sTreeDataProvider implements vscode.TreeDataProvider<Microk8sCloudProviderTreeNode> {
    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<Microk8sCloudProviderTreeNode | undefined> = new vscode.EventEmitter<Microk8sCloudProviderTreeNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Microk8sCloudProviderTreeNode | undefined> = this.onDidChangeTreeDataEmitter.event;

    getTreeItem(element: Microk8sCloudProviderTreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        if (element.nodeType === 'error') {
            const treeItem = new vscode.TreeItem("Error", vscode.TreeItemCollapsibleState.None);
            treeItem.tooltip = element.diagnostic;
            return treeItem;
        } else {
            const treeItem = new vscode.TreeItem("Microk8s Instance", vscode.TreeItemCollapsibleState.None);
            treeItem.contextValue = `microk8s.cluster ${k8s.CloudExplorerV1.SHOW_KUBECONFIG_COMMANDS_CONTEXT}`;
            return treeItem;
        }
    }

    getChildren(element?: Microk8sCloudProviderTreeNode | undefined): vscode.ProviderResult<Microk8sCloudProviderTreeNode[]> {
        if (element) {
            return [];
        }
        return [{ nodeType: 'cluster' }];
    }
}

async function getMicrok8sKubeconfigYaml(): Promise<string | undefined> {
    const yaml = await microk8s.getKubeconfig(shell);
    if (failed(yaml)) {
        if (yaml.error[0].includes('Insufficient permissions')) {
            vscode.window.showErrorMessage("Can't get kubeconfig for Microk8s. You need to add yourself to the 'microk8s' group using the command 'sudo usermod -a -G microk8s <your-name>' then log out and log in again.");
        } else {
            vscode.window.showErrorMessage(`Can't get kubeconfig for Microk8s: ${yaml.error[0]}`);
        }
        return undefined;
    }

    const originalKubeconfig = yaml.result;
    // TODO: distinct user name
    return originalKubeconfig;
}

export const MICROK8S_CLOUD_PROVIDER = new Microk8sCloudProvider();

export async function refresh(): Promise<void> {
    const cloudExplorer = await k8s.extension.cloudExplorer.v1;
    if (cloudExplorer.available) {
        cloudExplorer.api.refresh();
    }
}
