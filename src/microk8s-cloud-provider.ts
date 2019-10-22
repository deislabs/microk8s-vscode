import * as vscode from 'vscode';
import * as k8s from 'vscode-kubernetes-tools-api';

class Microk8sCloudProvider implements k8s.CloudExplorerV1.CloudProvider {
    readonly cloudName = "Microk8s";
    readonly treeDataProvider = new Microk8sTreeDataProvider();
    async getKubeconfigYaml(cluster: any): Promise<string | undefined> {
        return undefined;
    }
}

// TODO: the actual type
export type Microk8sCloudProviderTreeNode = any;

class Microk8sTreeDataProvider implements vscode.TreeDataProvider<Microk8sCloudProviderTreeNode> {
    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<Microk8sCloudProviderTreeNode | undefined> = new vscode.EventEmitter<Microk8sCloudProviderTreeNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Microk8sCloudProviderTreeNode | undefined> = this.onDidChangeTreeDataEmitter.event;

    getTreeItem(element: Microk8sCloudProviderTreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return new vscode.TreeItem("TODO: render");
    }

    getChildren(element?: Microk8sCloudProviderTreeNode | undefined): vscode.ProviderResult<Microk8sCloudProviderTreeNode[]> {
        return [];
    }
}

export const MICROK8S_CLOUD_PROVIDER = new Microk8sCloudProvider();

export async function refresh(): Promise<void> {
    const cloudExplorer = await k8s.extension.cloudExplorer.v1;
    if (cloudExplorer.available) {
        cloudExplorer.api.refresh();
    }
}
