/**
 * Cache module
 */
OrgCheck.Cache = {

    /**
     * Cache handler
     * @param configuration Object must contain 'isPersistant', 'cachePrefix', 'section', 'timestampKey', 'sizeKey' and 'versionKey'
     */
    Handler: function (configuration) {

        /**
        * Cache system to use. 
        *              If <code>isPersistant</code> is true, we use Local Storage, otherwise Session Storage.
        *              <b>Local storage</b> means data WILL NOT be erased after closing the browser. 
        *              <b>Session storage</b> means data WILL be erased after closing the browser. 
        *              See https://developer.mozilla.org/fr/docs/Web/API/Storage
        */
        const CACHE_SYSTEM = (configuration.isPersistant === true ? localStorage : sessionStorage);

        /**
         * Key for "timestamp" on every cache entry
         */
        const TIMESTAMP_KEY = configuration.timestampKey || "__TIMESTAMP__";
        
        /**
         * Key for "version" on every cache entry
         */
        const VERSION_KEY = configuration.versionKey || "__VERSION__";

        /**
         * Key for "size" on every cache entry
         */
        const SIZE_KEY = configuration.sizeKey || "__51Z3__";

        /**
         * Cache prefix
         */
        const PREFIX = configuration.cachePrefix;

        /**
         * Section
         */
        const SECTION = configuration.section;

        /**
        * Method to clear all OrgCheck cached items
        */
        this.clearAll = function () {
            let keys_to_remove = private_get_keys();
            for (let i = 0; i < keys_to_remove.length; i++) {
                private_delete_item(keys_to_remove[i]);
            }
        };

        /**
        * Method to clear one OrgCheck cached item
        * @param key in cache (without the prefix) to use
        * @return the previous value that has been deleted
        */
        this.clear = function (key) {
            const oldValue = private_delete_item(key);
            return oldValue;
        };

        /**
        * Method to get all keys of the WoldemOrg cache
        * @return All keys of the cache of the section.
        */
        this.keys = function () {
            const keys = private_get_keys();
            return keys;
        };

        /**
        * Method to get an item from the cache
        * @param key in cache (without the prefix) to use
        * @return the value in cache (undefined if not found)
        */
        this.getItem = function (key) {
            const value = private_get_item(key);
            return value;
        };

        /**
        * Method to get the timestamp and version of a specific cache item
        * @param key in cache (without the prefix) to use
        * @return the side values of the item in cache (undefined if not found)
        */
        this.sideValues = function (key) {
            const value = private_get_item(key);
            if (value) {
                return {
                    timestamp: value[TIMESTAMP_KEY],
                    version: value[VERSION_KEY],
                    size: value[SIZE_KEY]
                };
            }
            return;
        };

        /**
        * Method to set an item into the cache
        * @param key in cache (without the prefix) to use
        * @param value of the item to store in cache
        */
        this.setItem = function (key, value) {
            try {
                private_set_item(key, value);
            } catch (e) {
                private_log_error(e);
            }
        };

        /**
        * Method to cache error and clean other stuff in the page
        * @param key in cache (without the prefix) to use
        * @param retrieverCallback function that we call to get the value
        * @param finalCallback function to call after the value was got
        */
        this.cache = function (key, retrieverCallback, finalCallback) {
            // Query the cache first
            const value = private_get_item(key);
            // Is the cache available??
            if (value) {
                // Yes, the cache is available
                // Call the onEnd method with data coming from cache
                finalCallback(value, true);
            } else {
                // No, the cache is not available for this data
                retrieverCallback(function (newValue) {
                    // check if data is undefined
                    if (newValue) {
                        // Update the cache
                        try {
                            private_set_item(key, newValue);
                        } catch (e) {
                            private_log_error(e);
                        }
                    }
                    // Call the onEnd method with data not coming from cache
                    finalCallback(newValue, false);
                });
            }
        };

        /**
        * Method to get a property of an item from the cache
        * @param key in cache (without the prefix) to use
        * @param propertyKey the key of the property within the value in cache
        * @param defaultPropertyValue if the cache is not present or the property is not set, return that value
        * @return the value for this property
        */
         this.getItemProperty = function (key, propertyKey, defaultPropertyValue) {
            const value = private_get_item(key) || {};
            const propertyValue = value[propertyKey];
            if (propertyValue === undefined) return defaultPropertyValue;
            return propertyValue;
        };

        /**
        * Method to set a property of an item from the cache
        * @param key in cache (without the prefix) to use
        * @param propertyKey the key of the property within the value in cache
        * @param propertyValue the value for this property
        */
         this.setItemProperty = function (key, propertyKey, propertyValue) {
            const value = private_get_item(key) || {};
            value[propertyKey] = propertyValue;
            private_set_item(key, value);
        };

        /**
        * Log actions from the cache
        * @param e Error
        */
        function private_log_error(e) {
            console.error("[OrgCheck:Cache]", { error: e });
        }

        /**
        * Private method to generate the prefix used for keys in cache
        * @return Prefix generated from section name
        */
        function private_generate_prefix() {
            return PREFIX + '.' + SECTION + '.';
        }

        /**
        * Returns all the OrgCheck keys in cache
        * @return All the keys of the OrgCheck cache for the given section
        */
        function private_get_keys() {
            const prefix = private_generate_prefix();
            let keys_to_remove = [];
            for (let i = 0; i < CACHE_SYSTEM.length; i++) {
                const key = CACHE_SYSTEM.key(i);
                if (key && key.startsWith(prefix)) {
                    keys_to_remove.push(key.substr(prefix.length));
                }
            }
            return keys_to_remove;
        }

        /**
        * Private method to get an item from the cache
        * @param key in cache (without the prefix) to use
        * @return the value in cache (undefined if not found)
        */
        function private_get_item(key) {
            const k = private_generate_prefix() + key;
            const value = CACHE_SYSTEM.getItem(k);
            if (value) {
                let jsonValue = JSON.parse(value);
                if (jsonValue[VERSION_KEY] !== OrgCheck.version) {
                    CACHE_SYSTEM.removeItem(k);
                    return;
                }
                return jsonValue;
            }
            return;
        }

        /**
        * Private method to set an item into the cache
        * @param key in cache (without the prefix) to use
        * @param value of the item to store in cache
        */
        function private_set_item(key, value) {
            if (!value) return;
            try {
                value[TIMESTAMP_KEY] = Date.now();
                value[VERSION_KEY] = OrgCheck.version;
                CACHE_SYSTEM.setItem(
                    private_generate_prefix() + key,
                    JSON.stringify(value)
                );
            } catch (e) {
                throw Error("Failed to write in cache");
            } finally {
                // Make sure to delete the timestamp even after error
                delete value[TIMESTAMP_KEY];
                delete value[VERSION_KEY];
            }
        }

        /**
        * Private method to clear one OrgCheck cached item
        * @param key in cache (without the prefix) to use
        * @return the previous value that has been deleted
        */
        function private_delete_item(key) {
            return CACHE_SYSTEM.removeItem(private_generate_prefix() + key);
        }
    }
}