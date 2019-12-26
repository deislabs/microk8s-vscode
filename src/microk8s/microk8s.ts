import * as vscode from 'vscode';
import * as fs from 'fs';

// import * as config from '../config/config';

const logChannel = vscode.window.createOutputChannel("MicroK8s");

export function getKubeconfigYaml(): string {
    const kubeconfigfile = '/var/snap/microk8s/current/credentials/client.config';
    logChannel.appendLine(`Reading kubeconfig file at ${kubeconfigfile}`);
    return fs.readFileSync(kubeconfigfile, 'utf8');
}
