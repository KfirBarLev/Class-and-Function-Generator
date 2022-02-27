import * as utils from './utils';

export async function generateConstructor()
{
    var putCodeAt = await utils.optionBoxsForWherePutTheCode();
    if (!putCodeAt)
    {
        return;
    }
	
	var text: string[] | undefined = await constructorText("inline" === putCodeAt.label);
	if (!text)
    {
        return;
    }
	
	utils.insertText(text, putCodeAt.label);
}

export async function generateDestructor()
{
    var putCodeAt = await utils.optionBoxsForWherePutTheCode();
    if (!putCodeAt)
    {
        return;
    }
	
	var text: string[] | undefined = await destructorText("inline" === putCodeAt.label);
	if (!text)
    {
        return;
    }
	
	utils.insertText(text, putCodeAt.label);
}

async function constructorText(isInline: boolean)
{	
    var className: string = utils.getClassName();
	var defenitionText = '';
	var implementationText = '';
	
	if(!isInline)
	{	
	defenitionText =`
	` +
	className + "();\n" 
	; 

implementationText =`
		
`+className+`::`+ className +`()
{
	
}
`
;
	}
	else
	{
		
	implementationText =`
	` +
    className + "()" + `
	{
	  
	}

	`
	;
	}   
     
	let textArray: string[] = [];
	textArray[0] = implementationText;
	textArray[1] = defenitionText;

	return textArray;
}

async function destructorText(isInline: boolean)
{	
    var className: string = utils.getClassName();
	var defenitionText = '';
	var implementationText = '';
	
	if(!isInline)
	{	
	defenitionText =`
	` +
	"~"+className + "();\n" 
	; 

implementationText =`
		
`+className+`::`+ "~" + className +`()
{
	
}
`
;
	}
	else
	{
		
	implementationText =`
	` +
    "~"+className + "()" + `
	{
	  
	}

	`
	;
	}   
     
	let textArray: string[] = [];
	textArray[0] = implementationText;
	textArray[1] = defenitionText;

	return textArray;
}