// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as file from './classAndFileCreation';
import * as getSet from './getterAndSetter';
import * as equal from './equalityOperator';
import * as out from './streamOutputOperator';
import * as cd from './constructorDestructor';
import * as rel from './relationalOperators';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void 
{	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "class-generator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('class-generator.CreateClass', 
											async (args) => file.generateClassAndfiles(args, true, "both")));
	
	context.subscriptions.push(vscode.commands.registerCommand('class-generator.SourceFile', 
											async (args) => file.generateClassAndfiles(args, false, "cpp")));

    context.subscriptions.push(vscode.commands.registerCommand('class-generator.HeaderFile', 
											async (args) => file.generateClassAndfiles(args, false, "hpp")));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.HeaderAndSourceFiles', 
											async (args) => file.generateClassAndfiles(args, false, "both")));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.Getter', 
											async (args) => getSet.generateGetterSetter("getter")));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.Setter', 
											async (args) => getSet.generateGetterSetter("setter")));
												   											  		
	context.subscriptions.push(vscode.commands.registerCommand('class-generator.GetterAndSetter', 
											async (args) => getSet.generateGetterSetter("both")));
											
	context.subscriptions.push(vscode.commands.registerCommand('class-generator.EqualityOperator', 
											async (args) => equal.generateEqualityOperator()));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.StreamOutputOperator', 
											async (args) => out.generateStreamOutputOperator()));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.RelationalOperators', 
											async (args) => rel.generateRelationalOperator()));
	
	context.subscriptions.push(vscode.commands.registerCommand('class-generator.Constructor', 
											async (args) => cd.generateConstructor()));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.Destructor', 
											async (args) => cd.generateDestructor()));
										
}

// this method is called when your extension is deactivated
export function deactivate() {}
