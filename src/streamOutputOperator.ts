import * as vscode from 'vscode';
import * as utils from './utils';
import * as fs from 'fs';

export async function generateStreamOutputOperator()
{
    var putCodeAt = await utils.optionBoxsForWherePutTheCode();
    if (!putCodeAt)
    {
        return;
    }
	
	var text: string[] = []/*await equalityOperatorText("inline" === putCodeAt.label)*/;

	utils.insertText(text, putCodeAt.label);
}