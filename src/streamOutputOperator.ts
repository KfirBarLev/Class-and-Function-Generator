import * as utils from './utils';

export async function generateStreamOutputOperator()
{
    var putCodeAt = await utils.optionBoxsForWherePutTheCode();
    if (!putCodeAt)
    {
        return;
    }
	
	var text: string[] | undefined = await streamOutputOperatorText("inline" === putCodeAt.label);
    if (!text)
    {
        return;
    }

	utils.insertText(text, putCodeAt.label);
}


async function streamOutputOperatorText(isInline: boolean = false)
{	
    var clasName: string = '';
	var defenitionText = '';
	var implementationText = '';
    var includeString: string = "#include <ostream>\n";
	
	if(!isInline)
	{
		clasName =  utils.getClassName();
		let membersText = await streamOutMembersText();
		if (!membersText)
		{
			return;
		}
	
	defenitionText =`
	` +
	"friend std::ostream &operator<<(std::ostream &os, const " + clasName + " &rhs);\n"
	; 

implementationText =`
` +
"std::ostream &operator<<(std::ostream &os, const " + clasName + " &rhs)" + `
{
` + membersText + `
}

`
;
	}
	else
	{
		let membersText = await streamOutMembersText(true);
		if (!membersText)
		{
			return;
		}
        
	implementationText =`
	` + 
	"friend std::ostream &operator<<(std::ostream &os, const " + utils.getClassName() + " &rhs)" + `
	{
	` + membersText + `
	}
	`;
	}   
     
	let textArray: string[] = [];
	textArray[0] = implementationText;
	textArray[1] = defenitionText;
    textArray[2] = includeString;

	return textArray;
}

async function streamOutMembersText(isInline: boolean = false)
{
	var tab: string = "";
	if (isInline)
	{
		tab = "    ";
	}
	
	var membersNames = await utils.optionBoxForClassMembers();
	if (!membersNames)
	{
		return;
	}

	var text: string = '';
	for (var member of membersNames)
	{
		if (member === membersNames[0])
		{
			text += "    os << " + "\"" + member + ":" + " \"" + " << " + "rhs." + member;
		}
		else
		{
			text += "\n" + tab + "	   << " + "\"" + member + ":" + " \"" + " << " + "rhs." + member;
		}

		if (member === membersNames[membersNames.length - 1])
		{
			text += ";";
            text += "\n" + tab + "    return os;";
		}
	}

	return text;
}