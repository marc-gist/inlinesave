CKEDITOR.plugins.add( 'inlinesave',
{
	init: function( editor )
	{
		var config = editor.config.inlinesave,
		    iconName = !!config.useColorIcon ? 'inlinesave-color.svg' : 'inlinesave.svg';

		editor.addCommand( 'inlinesave',
			{
				exec : function( editor )
				{
                    var sendDataOk = true;
					var postData = {},
					    payload = '',
					    contentType = 'application/x-www-form-urlencoded; charset=UTF-8';

					if (typeof config == "undefined") { // Give useful error message if user doesn't define config.inlinesave
						throw new Error("CKEditor inlinesave: You must define config.inlinesave in your configuration file. See http://ckeditor.com/addon/inlinesave");
						return;
					}
					if (typeof config.postUrl == "undefined") { // Give useful error message if user doesn't define config.inlinesave.postUrl (or config.inlinesave)
						throw new Error("CKEditor inlinesave: You must define config.inlinesave.postUrl in your configuration file. See http://ckeditor.com/addon/inlinesave");
						return;
					}

					if (typeof config.onSave == "function") {
						sendDataOk = config.onSave(editor); // Allow showing 'loading' spinner
					}

                    if (!sendDataOk) {
                        throw new Error("CKEditor inlinesave: Saving Disable by return of onSave function = false");
                        return;
                    } else {

                        // Clone postData object from config and add editabledata and editorID properties
                        CKEDITOR.tools.extend(postData, config.postData || {}, true); // Clone config.postData to prevent changing the config.
                        postData.editabledata = editor.getData();
                        postData.editorID = editor.container.getId();

                        // If user opts to use JSON format for sending data to server, use Content-type 'application/json'.
                        if (!!config.useJSON) {
                            payload = JSON.stringify(postData);
                            contentType = 'application/json; charset=UTF-8';
                        }
                        // Otherwise use the default Content-type, 'application/x-www-form-urlencoded'.
                        else {
                            // Convert postData object to multi-part form data query string for post like jQuery does by default.
                            var formData = '';
                            for (var key in postData) { // Must encode data to handle special characters
                                formData += '&' + key + '=' + encodeURIComponent(postData[key]);
                            }
                            payload = formData.slice(1); // Remove initial '&'
                        }

                        // Use pure javascript (no dependencies) and send the data in json format...
                        var xhttp = new XMLHttpRequest();
                        xhttp.onreadystatechange = function () {
                            if (xhttp.readyState == 4) {
                                // If success, call onSuccess callback if defined
                                if (typeof config.onSuccess == "function" && xhttp.status == 200) {
                                    // Allow server to return data via xhttp.response
                                    config.onSuccess(editor, xhttp.response);
                                }
                                // If error, call onFailure callback if defined
                                else if (typeof config.onFailure == "function") {
                                    config.onFailure(editor, xhttp.status, xhttp);
                                }
                            }
                        };
                        xhttp.open("POST", config.postUrl, true);
                        // Send as form data encoded to handle special characters.
                        xhttp.setRequestHeader("Content-type", contentType);
                        xhttp.send(payload);
                    }
				}
			});
		editor.ui.addButton( 'Inlinesave',
		{
			label: 'Save',
			command: 'inlinesave',
			icon: this.path + 'images/' + iconName
		} );
	}
} );
