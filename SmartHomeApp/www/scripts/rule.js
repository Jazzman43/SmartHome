$(document).on("pagecreate", "#rule", function () { // When the "device" page is inserted into the DOM...

    /**
     * Flow for adding widgets to the "Rule" page...
     */
    var params = $SH_GetParameters($(this).attr("data-url"));

    var found = false;
    var rule;

    if (!params.id && !params.value) { // Verify that we have the correct URL parameters...
        throw new Error("Missing required URL parameters");
    }
    else { // Pump the page full of widgets...

        FIREBASE_RULES_OBJ.child("device_rules").once("value", function (data) {

            var rle = data.val();

            for(var i in rle) {

                if(i == params.id) {

                    found = true;

                    rule = rle[i];
                    rule.key = i;

                    // The rule doesn't exist for some reason, even though we iterated through the RULES_GLOBAL,
                    // this should never happen.
                    if (!rule)
                        throw new Error("Unable to find rule. The rule '" + rule.name + "' does not exist.");

                    //injectWidgetsStatic(rule);

                    // Make the page header the device's name
                    $("h1.rule-name").html(UCFirst(rule.alias));

                    // Set the schedule name input field to the schedule's alias
                    $("#rule-input-name").val(rule.alias);

                    // Set the "Device Selector" to the DB Value:
                    $("#rule-source-device").find("option[value=\"" + rule.source_mac + "\"]").prop("selected", true);
                    $("#rule-target-device").find("option[value=\"" + rule.target_mac + "\"]").prop("selected", true);

                    $("#rule-source-device").selectmenu().selectmenu("refresh", true);
                    $("#rule-target-device").selectmenu().selectmenu("refresh", true);

                    // <-------------------------- BIND THE RULE'S SETTINGS --------------------------> //

                    $("#rule-input-name").change(function () {
                        rule.alias = $(this).val();
                        $("h1.rule-name").html(UCFirst(rule.alias));
                        FIREBASE_RULES_OBJ.child("device_rules").child(rule.key).update(rule);
                    });

                    $("#schedule-source-device").change(function () {

                        var value = cleanValue($(this).val());

                        rule.source_mac   = value;
                        rule.source_path  = [];
                        rule.source_value = [];

                        FIREBASE_RULES_OBJ.child(i).update(rule);

                        //injectWidgetsStatic(rule);
                        $("#rule").trigger("create");
                    });

                    $("#schedule-target-device").change(function () {

                        var value = cleanValue($(this).val());

                        rule.target_mac   = value;
                        rule.target_path  = [];
                        rule.target_value = [];

                        FIREBASE_RULES_OBJ.child(i).update(rule);

                        //injectWidgetsStatic(rule);
                        $("#rule").trigger("create");
                    });

                    $("#delete-rule").click(function (e) {

                        e.stopPropagation();
                        e.preventDefault();

                        FIREBASE_RULES_OBJ.child("device_rules").child(i).remove();
                        $.mobile.changePage('rules.html', { transition: PAGE_TRANSITION_TYPE });
                        return;

                    });

                    break;

                } // End if block

            } // End for loop

            if(!found) {
                $.mobile.changePage("rules.html");
            }
        });
    }

}); // End $(document).on("pagecreate")

$(document).on("pagebeforecreate", "#rule", function () { // When the "device" page is inserted into the DOM...
    var keys = Object.keys(global[DEVICES_GLOBAL]);
    for (var i in global[DEVICES_GLOBAL]) {
        $("#rule-source-device").append('<option ' + ((keys[0] == i) ? "selected" : "") + ' value="' + global[DEVICES_GLOBAL][i].mac + '">' + UCFirst(global[DEVICES_GLOBAL][i].name.replace(/[^a-z0-9]/ig, ' ')) + '</option>');
        $("#rule-target-device").append('<option ' + ((keys[0] == i) ? "selected" : "") + ' value="' + global[DEVICES_GLOBAL][i].mac + '">' + UCFirst(global[DEVICES_GLOBAL][i].name.replace(/[^a-z0-9]/ig, ' ')) + '</option>')
    }
});