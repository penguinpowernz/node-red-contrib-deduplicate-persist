"use strict";
module.exports = function (RED) {
    function DeDuplicate(config) {
        RED.nodes.createNode(this, config);
        this.keyproperty = config.keyproperty;
        var node = this;

        fs.readFile(node.id+"_dedupe", (err, data) => {
            if (err) throw err;
            node.cache = JSON.parse(data);
        });
        
        function cacheContains(key) {
            var i;
            for (i = 0; i < node.cache.length; i += 1) {
                if (node.cache[i].key === key) {
                    return true;
                }
            }
            return false;
        }
        
        function saveToDisk() {
            require('fs').writeFile(node.id+"_dedupe", JSON.stringify(node.cache), function() {});
        }

        this.on('input', function (msg) {
            if (node.cache === undefined) {
                node.cache = [];
            }

            var key = node.keyproperty ? msg.payload[node.keyproperty] : msg.payload;
            if (cacheContains(JSON.stringify(key))) {
                node.send([null, msg]);
                return;
            }

            node.cache.push({key: JSON.stringify(key)});
            node.send([msg, null]);
            saveToDisk();
        });
    }
    RED.nodes.registerType("deduplicate", DeDuplicate);
};
