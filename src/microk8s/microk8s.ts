import * as vscode from 'vscode';

// import * as config from '../config/config';
import { Errorable } from '../utils/errorable';
import * as shell from '../utils/shell';

const logChannel = vscode.window.createOutputChannel("Microk8s");

async function invokeObj<T>(sh: shell.Shell, command: string, args: string, opts: shell.ExecOpts, fn: (stdout: string) => T, errfn?: (sr: shell.ShellResult) => Errorable<T>): Promise<Errorable<T>> {
    const bin = /* config.microk8sPath() || */ 'microk8s';
    const cmd = `${bin}.${command} ${args}`;
    logChannel.appendLine(`$ ${cmd}`);
    return await sh.execObj<T>(
        cmd,
        `microk8s.${command}`,
        opts,
        andLog(fn),
        errfn
    );
}

function andLog<T>(fn: (s: string) => T): (s: string) => T {
    return (s: string) => {
        logChannel.appendLine(s);
        return fn(s);
    };
}

export async function getKubeconfig(sh: shell.Shell): Promise<Errorable<string>> {
    const onError = (sr: shell.ShellResult): Errorable<string> => {
        if (sr.stderr && sr.stderr.trim().length > 0) {
            return { succeeded: false, error: [sr.stderr] };
        }
        return { succeeded: false, error: [sr.stdout] };  // Because Microk8s prints permissions errors to stdout
    };
    return invokeObj(sh, `kubectl config view`, ` --raw`, {}, (s) => s, onError);
}
