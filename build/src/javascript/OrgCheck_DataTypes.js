/**
 * Data Types
 */
 OrgCheck.DataTypes = {

    SecurityHandler: function() {

        this.htmlSecurise = function(data) {
            return data;
        };
    },

    /**
    * Date
    * @param configuration Object must contain 'defaultLanguage', 'defaultDateFormat' and 'defaultDatetimeFormat'
    */
    DateHandler: function(configuration) {

        /**
        * Returns the string representation of a given date using the user's preferences
        * @param value to format (number if a timestamp, string otherwise)
        */
            this.dateFormat = function (value) {
            return private_date_format(
                value,
                UserContext.dateFormat,
                configuration.defaultDateFormat
            );
        };

        /**
        * Returns the string representation of a given datetime using the user's preferences
        * @param value to format (number if a timestamp, string otherwise)
        */
        this.datetimeFormat = function (value) {
            return private_date_format(
                value,
                UserContext.dateTimeFormat,
                configuration.defaultDatetimeFormat
            );
        };

        /**
        * Private method to format data/time into a string representation
        * @param value to format (number if a timestamp, string otherwise)
        * @param format to use
        * @param formatIfNull to use if the previous parameter was null or empty
        */
        function private_date_format(value, format, formatIfNull) {
            if (value) {
                const timestamp = typeof value === "number" ? value : Date.parse(value);
                return DateUtil.formatDate(
                    new Date(timestamp),
                    format ? format : formatIfNull
                );
            }
            return "";
        }
    },

    /**
     * Manage a "map" in this context which is an object containing
     * Salesforce IDs as properties plus an extra property called
     * "size" which is the number of Salesforce IDs contained in the
     * object.
     * @param configuration Object must contain 'keySize' and 'keyExcludePrefix'
     */
    MapHandler: function (configuration) {

        /**
         * Iterative function for each key of the given map
         * @param map Given map
         * @param keyCallback function to call for each key of the given map
         */
        this.forEach = function (map, keyCallback) {
            for (let key in map)
                if (map.hasOwnProperty(key) && key !== configuration.keySize 
                        && !key.startsWith(configuration.keyExcludePrefix)) {
                    keyCallback(key);
                }
        };

        /**
         * Returns the size of the map (as stored)
         * @param map Given map
         */
        this.getSize = function (map) {
            return map[configuration.keySize];
        };

        /**
        * Set the size of the map
        * @param map Given map
        * @param newSize
        */
        this.setSize = function (map, newSize) {
            map[configuration.keySize] = newSize;
        };

        /**
        * Returns the keys of the map (excluding the technical size key!)
        * @param map Given map
        * @return Keys of the map
        */
        this.keys = function (map) {
            if (!map) return [];
            const keys = Object.keys(map);
            return keys.filter(key => key !== configuration.keySize && !key.startsWith(configuration.keyExcludePrefix));
        };
    },

    /**
    * Array helper
    */
    ArrayHandler: function () {
        /**
        * Concatenate two arrays
        * @param array1 First array (will not be modified)
        * @param array2 Second array (will not be modified)
        * @param prop Optionnal property to use in the arrays
        * @return A new array containing uniq items from array1 and array2
        */
        this.concat = function (array1, array2, prop) {
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
        };
    }
};


