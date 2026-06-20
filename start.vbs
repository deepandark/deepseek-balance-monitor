CreateObject("WScript.Shell").Run "node """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\scripts\dev.js""", 0, False
