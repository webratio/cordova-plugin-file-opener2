function createStubs() {

    function log() {
        var args = [].slice.call(arguments, 0);
        args.unshift("[File Opener]");
        console.log.apply(console, args);
    }

    function getFileSystemsOrigin() {
        return new Promise(function(resolve, reject) {
            window.webkitRequestFileSystem(0 /* TEMPORARY */, 0, function(fs) {
                var m = /^filesystem:(?:[^\/]+:\/\/)?[^\/]+/.exec(fs.root.toURL());
                if (!m) {
                    reject(new Error("Unable to resolve file system origin"));
                } else {
                    resolve(m[0]);
                }
            }, reject);
        });
    }

    var viewer = null;

    function getViewer() {
        if (viewer) {
            return viewer;
        }

        /* Create wrapper */
        var div = document.createElement("DIV");
        div.style.background = "black";
        div.style.position = "fixed";
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.zIndex = "10000";
        /* > Create button */
        var button = document.createElement("BUTTON");
        button.style.height = "5%";
        button.innerHTML = "Done";
        div.appendChild(button);
        /* > Create iframe */
        var iframe = document.createElement("IFRAME");
        iframe.style.width = "100%";
        iframe.style.height = "95%";
        iframe.style.border = "0";
        div.appendChild(iframe);
        
        document.body.appendChild(div);
        log("Viewer opened");

        viewer = {
            setURL: function(url) {
                log("Viewer loading URL", url);
                iframe.src = url;
            },
            close: function() {
                log("Viewer closed");
                div.parentNode.removeChild(div);
                viewer = null;
            }
        };
        
        button.addEventListener("click", function(event) {
            viewer.close();
        });

        return viewer;
    }

    return {
        FileOpener2: {
            open: function(url, contentType) {
                log("Requested opening of", url, contentType);

                /* Reject generic/missing content types, as the device would do */
                if (!contentType || /^application\/octet-stream\b.*?$/i.test(contentType)) {
                    throw new Error("Cannot open file of unknown/generic type");
                }

                /* Resolve URL */
                var promise = Promise.resolve(url);
                if (/^cdvfile:\//.test(url)) {

                    /* Transform Cordova URLs into file system URLs by inferring the file systems origin */
                    promise = promise.then(function(cordovaUrl) {
                        return getFileSystemsOrigin().then(function(originUrl) {
                            var fsNameAndPath = cordovaUrl.replace(/^cdvfile:\/\/[^\/]+/, "");
                            return originUrl + fsNameAndPath;
                        });
                    });
                }

                /* Open */
                promise = promise.then(function(resolvedUrl) {
                    getViewer().setURL(resolvedUrl);
                });

                return promise;
            }
        }
    };
};