/**
 * Data Types module
 */
 OrgCheck.DataTypes = {

    /**
     * String sub-module
     */
     String: {
        
        /**
        * String handler
        */
        Handler: function() {

            /**
             * Return an HTML-safer version of the given string value
             * @param unsafe String to be escaped (no change if null or not a string type)
             */
             this.htmlSecurise = (unsafe) => {
                if (unsafe === undefined || Number.isNaN(unsafe) || unsafe === null) return '';
                if (typeof(unsafe) !== 'string') return unsafe;
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            };
        }
    },

    /**
     * Date and Datetime sub-module
     */
    Date: {

        /**
        * Date handler
        * @param configuration Object must contain 'defaultLanguage', 'defaultDateFormat' and 'defaultDatetimeFormat'
        */
        Handler: function(configuration) {

            /**
            * Returns the string representation of a given date using the user's preferences
            * @param value to format (number if a timestamp, string otherwise)
            */
            this.dateFormat = (value) => {
                return private_date_format(value, UserContext?.dateFormat,
                    configuration.defaultDateFormat
                );
            };

            /**
            * Returns the string representation of a given datetime using the user's preferences
            * @param value to format (number if a timestamp, string otherwise)
            */
            this.datetimeFormat = (value) => {
                return private_date_format(value, UserContext?.dateTimeFormat,
                    configuration.defaultDatetimeFormat
                );
            };

            /**
            * Private method to format data/time into a string representation
            * @param value to format (number if a timestamp, string otherwise)
            * @param format to use
            * @param formatIfNull to use if the previous parameter was null or empty
            */
            const private_date_format = (value, format, formatIfNull) => {
                if (value) {
                    const timestamp = typeof value === "number" ? value : Date.parse(value);
                    return DateUtil.formatDate(new Date(timestamp), format ? format : formatIfNull);
                }
                return '';
            }
        },

    },

    /**
     * Collection sub-module
     */
    Collection: {

        /**
         * Manage a "map" in this context which is an object containing
         * Salesforce IDs as properties plus an extra property called
         * "size" which is the number of Salesforce IDs contained in the
         * object.
         * @param configuration Object must contain 'keySize' and 'keyExcludePrefix'
         */
        MapHandler: function (configuration) {

            /**
             * @param key 
             * @return if that key is functional (not technical)
             */
            const private_is_safe_key = (key) => {
                return (key !== configuration.keySize 
                    && !key.startsWith(configuration.keyExcludePrefix));
            }

            /**
             * @param map
             * @return List all functional keys 
             */
            const private_get_safe_keys = (map) => {
                if (map) return Object.keys(map).filter(k => private_is_safe_key(k));
            };

            /**
             * Creates a new Map
             * @return the new map instance
             */
            this.newMap = () => {
                const map = new Map();
                map[configuration.keySize] = 0;
                return map;
            }

            /**
             * @return the value for the key of the map (only if the key is safe)
             */
            this.getValue = (map, key) => {
                if (private_is_safe_key(key)) return map[key];
            };

            /**
             * Retrieve the value for the key of the map (only if the key is safe)
             * @param map
             * @param key 
             * @param value 
             */
             this.setValue = (map, key, value) => {
                if (private_is_safe_key(key)) {
                    if (map.hasOwnProperty(key) === false) map[configuration.keySize]++;;
                    map[key] = value;
                }
            };

            /**
             * Iterative function for each key of the given map
             * @param map
             * @param fn function to call for each key
             */
            this.forEach = (map, fn) => {
                private_get_safe_keys(map).forEach(k => fn(k));
            };

            /**
             * @param map
             * @return the size of the map
             */
            this.size = (map) => {
                return map[configuration.keySize];
            };

            /**
             * Returns the keys of the map (excluding the technical ones!)
             * @param map
             */
            this.keys = (map) => {
                return private_get_safe_keys(map);
            };
        },

        /**
        * Array handler
        */
        ArrayHandler: function () {
            /**
            * Concatenate two arrays
            * @param array1 First array (will not be modified)
            * @param array2 Second array (will not be modified)
            * @param prop Optionnal property to use in the arrays
            * @return A new array containing uniq items from array1 and array2
            */
            this.concat = (array1, array2, prop) => {
                if (prop) {
                    let new_array = [];
                    let array2_keys = [];
                    if (array2) for (let i = 0; i < array2.length; i++) {
                        const item2 = array2[i];
                        array2_keys.push(item2[prop]);
                        new_array.push(item2);
                    }
                    if (array1) for (let i = 0; i < array1.length; i++) {
                        const item1 = array1[i];
                        const key1 = item1[prop];
                        if (array2_keys.indexOf(key1) < 0) {
                            new_array.push(item1);
                        }
                    }
                    return new_array;
                } else {
                    let uniq_items_to_add;
                    if (array1) {
                        uniq_items_to_add = array1.filter((item) => array2.indexOf(item) < 0);
                    } else {
                        uniq_items_to_add = [];
                    }
                    if (array2) {
                        return array2.concat(uniq_items_to_add);
                    } else {
                        return uniq_items_to_add;
                    }
                }
            }
        }
    }
}