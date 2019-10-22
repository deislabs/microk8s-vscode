import * as vscode from 'vscode';

// import * as config from '../config/config';
import { Errorable } from '../utils/errorable';
import * as shell from '../utils/shell';
import '../utils/array';

const logChannel = vscode.window.createOutputChannel("Microk8s");

async function invokeObj<T>(sh: shell.Shell, command: string, args: string, opts: shell.ExecOpts, fn: (stdout: string) => T): Promise<Errorable<T>> {
    const bin = /* config.microk8sPath() || */ 'microk8s';
    const cmd = `${bin} ${command} ${args}`;
    logChannel.appendLine(`$ ${cmd}`);
    return await sh.execObj<T>(
        cmd,
        `microk8s.${command}`,
        opts,
        andLog(fn)
    );
}

function andLog<T>(fn: (s: string) => T): (s: string) => T {
    return (s: string) => {
        logChannel.appendLine(s);
        return fn(s);
    };
}

export async function getKubeconfig(sh: shell.Shell): Promise<Errorable<string>> {
    return invokeObj(sh, `kubectl config view`, ` --raw`, {}, (s) => s);
}
