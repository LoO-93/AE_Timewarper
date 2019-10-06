{
    function myScript(thisObj){
        function myScript_buildUI(thisObj){
            var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Timewarp", undefined, {resizeable:true, closeButton: true});
            
            '''create UI-elements'''
            var groupOne = myPanel.add("group", undefined,  "groupOne")
            groupOne.orientation = "row"
            var warpButton = groupOne.add("button", undefined, "Warp it!")
            var staticText = groupOne.add("statictext", undefined, "Loops:")
            var editText = groupOne.add("edittext", [5,140,50,160], "")
            
            '''set on-click function for the button'''
            warpButton.onClick = function() {
                '''check for correct loop amount before running script'''
                if(!parseInt(editText.text) || parseInt(editText.text) < 1 || parseInt(editText.text) > 1000) {
                    alert("Please enter a loop amount!\n   [1 <= amount <= 1000]")
                }
                else {
                    timewarp(parseInt(editText.text));
                }
            }
            
            '''set layout'''
            myPanel.layout.layout(true);
            return myPanel;
        }
        
        '''check if panel is dockable or floating window'''
        var myScriptPal = myScript_buildUI(thisObj);
        if (myScriptPal != null && myScriptPal instanceof Window){
            myScriptPal.center();
            myScriptPal.show();
        }
    }
    myScript(this);
}

function timewarp(loopAmount) {
    '''get selected composition'''
    var myComp = app.project.activeItem;
    if (myComp && myComp instanceof CompItem) {
        '''alert if multiple or no layers are selected'''
        if (myComp.selectedLayers.length > 1) {
            alert("Please select only one layer");
        }
        else if (myComp.selectedLayers.length < 1) {
            alert("No layer selected");
        }

        else {
            '''get selected layer's time information'''
            rootInPoint = myComp.selectedLayers[0].inPoint
            rootStartDelta = rootInPoint - myComp.selectedLayers[0].startTime
            rootDuration = myComp.selectedLayers[0].outPoint - rootInPoint
            
            '''move selected layer's start-time to 0 to get zeroed composition starting timecode'''
            myComp.selectedLayers[0].startTime = 0
            
            '''create one dimensional index array for precompose() parameter'''
            var myIndex = []
            myIndex.push(myComp.selectedLayers[0].index)
            
            '''precompose selected layer to new composition'''
            var loopComp = myComp.layers.precompose(myIndex, myComp.selectedLayers[0].name+"_LOOP")
            
            '''move nested layer's in-point to start of new composition before looping'''
            loopComp.layers[1].startTime = 0 - loopComp.layers[1].inPoint
            
            '''loop nested layer in new composition'''
            for (i=1; i<loopAmount;i++) {
                loopComp.layers[i].duplicate()
                loopComp.layers[i+1].startTime = (rootDuration * i) - rootStartDelta
            }
            
            '''set loop-comp's starting point and duration'''
            myComp.layers[myIndex[0]].startTime = rootInPoint
            loopComp.duration = rootDuration * loopAmount
            myComp.layers[myIndex[0]].outPoint = myComp.layers[myIndex[0]].startTime + loopComp.duration
            
            '''add timewarp effect'''
            myComp.layers[myIndex[0]].Effects.addProperty("ADBE Timewarp")
        }
    }
    else {
        alert("No composition selected")
    }
}
