// Dependencies with:
// - OrgCheck.DataTypes.SecurityHandler.htmlSecurise() <-- SECURITY_HANDLER.htmlSecurise()
// - OrgCheck.DataTypes.DateHandler.dateFormat() <-- FORMAT_HANDLER.dateFormat()
// - OrgCheck.DataTypes.DateHandler.datetimeFormat() <-- FORMAT_HANDLER.datetimeFormat()

/**
 * Visual Components
 */
OrgCheck.VisualComponents = {

    /**
     * List of decorator handlers needed for this component
     * @param handlers JSON configuration including:
     *              <ol>
     *                <li><code>SecurityHandler</code>: method with one argument (html code text) that returns the securised version of the argument</li>
     *                <li><code>DateHandler</code>: method with one argument (html code text) that returns the securised version of the argument)</li>
     *              </ol>
     */
    DatatableHandler: function(handlers) { 
     
        const SECURITY_HANDLER = handlers.SecurityHandler;
        const FORMAT_HANDLER = handlers.DateHandler;

        /**
         * Creates a datatable
         * @param config JSON configuration including:
         *              <ol>
         *                <li><code>element</code>: name of the root element where the table will be added as a child node.</li>
         *                <li><code>showSearch</code>: boolean, if <code>true</code>, show a search box, <code>false</code> by default.</li>
         *                <li><code>showStatistics</code>: boolean, if <code>true</code>, show some stats at the top, <code>false</code> by default.</li>
         *                <li><code>showLineCount</code>: boolean, if <code>true</code>, show an additional '#' column with line count, <code>false</code> by default.</li>
         *                <li><code>columns</code>: array[JSON], description of each column of the datatable</li>
         *                <li><code>sorting</code>: JSON, describe which initial column will be used to sort data.</li>
         *                <li><code>data</code>: array[JSON], data of the table (as a map with Id as index)</li>
         *                <li><code>filtering</code>: JSON, description of an optional filter to apply to the visual representation.</li>
         *              </ol>
         */
        this.create = function(config) {

            // Get a pointer to the main element
            const mainElement = (typeof config.element === 'string') ? document.getElementById(config.element) : config.element;

            // Create first children of the main element, like counter, filter, footer and table
            const counters = mainElement.appendChild(document.createElement('span'));
            const filterCounters = mainElement.appendChild(document.createElement('span'));
            let main = mainElement.appendChild(document.createElement('div'));
            const footer = mainElement.appendChild(document.createElement('span'));

            if (config.showSearch === true) { 
                const searchBox = mainElement.insertBefore(document.createElement('div'), main);
                const searchIcon = searchBox.appendChild(document.createElement('img'));
                const search = searchBox.appendChild(document.createElement('input'));
                searchBox.classList.add('slds-input-has-icon', 'slds-input-has-icon_left');
                searchIcon.classList.add('slds-icon','slds-input__icon','slds-input__icon_left','slds-icon-text-default');
                searchIcon.setAttribute('src', '/img/chatter/lookupSearchHover.png');
                search.classList.add('slds-input');
                search.setAttribute('placeholder', 'Search any field (case sensitive) and press Enter');
                search.onkeydown = function(e) {
                    if (e.code === 'Enter') {
                        const searchValue = e.target.value;
                        const items = [].slice.call(table.rows).slice(1);
                        let nbVisible = 0;
                        table.hidden = true; // make table invisible while manipulating the DOM
                        items.forEach(tr => {
                            if (!searchValue) {
                                tr.hidden = false;
                                nbVisible++;
                            } else {
                                let hidden = true;
                                const lowerCaseSearchValue = searchValue.toLowerCase();
                                for (let i=0; i<tr.children.length; i++) {
                                    const v = tr.children[i].innerText?.toLowerCase();
                                    if (v && v.includes && v.includes(lowerCaseSearchValue)) {
                                        hidden = false;
                                        nbVisible++;
                                        break;
                                    }
                                }
                                tr.hidden = hidden;
                            }
                        });
                        if (config.showStatistics === true) {
                            if (searchValue) {
                                filterCounters.innerHTML = ', Filter is <b><code>on</code></b>, Number of visible rows: <b><code>'+nbVisible+'</code></b>';
                            } else {
                                filterCounters.innerHTML = ', Filter is <b><code>off</code></b>';
                            }
                        }
                        if (nbVisible == 0) {
                            footer.innerHTML = 'No data to show with this filter.';
                        } else {
                            footer.innerHTML = '';
                        }
                        table.hidden = false; // make table visible again
                    }
                };
            }

            if (config.stickyHeaders) {
                main.classList.add('slds-table--header-fixed_container', 'slds-scrollable_x');
                main.style.height = '87vh';
                main.style.width = '100vw';
                main = main.appendChild(document.createElement('div'));
                main.classList.add('slds-scrollable');
                main.style.height = '100%';
                main.style.width = '100%';
            }
            const table = main.appendChild(document.createElement('table'));
            table.classList.add('slds-table', 'slds-table_bordered');
            if (config.stickyHeaders) {
                table.classList.add('slds-table_header-fixed');
            }

            // Add all columns
            const thead = table.appendChild(document.createElement('thead'));
            const trHead = thead.appendChild(document.createElement('tr'));
            if (config.showLineCount === true) config.columns.unshift({ name: '#' });
            const orderingImage = document.createElement('img');
            let firstSortCallback;
            config.columns.forEach((c, i) => {
                const thHead = trHead.appendChild(document.createElement('th'));
                thHead.setAttribute('scope', 'col');
                thHead.setAttribute('aria-label', c.name);
                thHead.classList.add('slds-is-sortable');
                const aHead = thHead.appendChild(document.createElement('a'));
                aHead.classList.add('slds-th__action', 'slds-text-link_reset', 'slds-truncate');
                aHead.setAttribute('href', 'javascript:void(0);');
                aHead.setAttribute('role', 'button');
                aHead.setAttribute('tabindex', i);
                if (config.stickyHeaders) aHead.classList.add('slds-cell-fixed');
                const grdHead = aHead.appendChild(document.createElement('div'));
                grdHead.classList.add('slds-grid', 'slds-grid_vertical-align-center', 'slds-has-flexi-truncate');
                const ttlHead = grdHead.appendChild(document.createElement('span'));
                ttlHead.classList.add('slds-truncate');
                ttlHead.setAttribute('title', c.name);
                ttlHead.textContent = c.name;
                if (config.sorting) {
                    aHead.onclick = function(e) { 
                        if (e) {
                            if (config.sorting.name === c.name) {
                                config.sorting.order = (config.sorting.order !== 'asc') ? 'asc' : 'desc';
                            } else {
                                config.sorting.name = c.name;
                                config.sorting.order = 'asc';
                            }
                            if (orderingImage.parentNode) {
                                orderingImage.parentNode.removeChild(orderingImage);
                            }
                        }
                        if (config.sorting.order === 'asc') {
                            thHead.setAttribute('aria-sort', 'ascending');
                            orderingImage.src = '/img/sort_asc_arrow.gif';
                        } else {
                            thHead.setAttribute('aria-sort', 'descending');
                            orderingImage.src = '/img/sort_desc_arrow.gif';
                        }
                        grdHead.appendChild(orderingImage);
                        const iOrder = config.sorting.order === 'asc' ? 1 : -1;
                        const items = [].slice.call(table.rows).slice(1);
                        const isCellNumeric = c.type === 'numeric';
                        items.sort(function compare(a, b) {
                            const ca = a.getElementsByTagName('td')[i];
                            const cb = b.getElementsByTagName('td')[i];
                            const va = ca.hasAttribute('aria-data') ? ca.getAttribute('aria-data') : ca.textContent;
                            const vb = cb.hasAttribute('aria-data') ? cb.getAttribute('aria-data') : cb.textContent;
                            if (isCellNumeric) {
                                if (va && vb) return (va - vb) * iOrder;
                                if (va) return iOrder;
                                if (vb) return -iOrder;
                            }
                            if (va < vb) return -iOrder;
                            if (va > vb) return iOrder;
                            return 0;
                        });
                        table.hidden = true; // make table invisible while manipulating the DOM
                        let countRow = 1;
                        items.forEach(r => {
                            const parent = r.parentNode;
                            const detatchedItem = parent.removeChild(r);
                            parent.appendChild(detatchedItem);
                            if (config.showLineCount === true) {
                                detatchedItem.firstChild.innerText = countRow;
                                countRow++;
                            }
                        });
                        table.hidden = false; // make table visible again
                    };
                    if (config.sorting.name === c.name) {
                        firstSortCallback = function() { aHead.onclick(); }
                    }
                }
            });

            const isArray = Array.isArray(config.data);
            const iterable = isArray ? config.data : config.datakeys;

            // Add the rows
            const tbody = table.appendChild(document.createElement('tbody'));
            table.hidden = true; // make table invisible while manipulating the DOM
            let nbRows = 0, nbBadRows = 0, sumScore = 0;
            iterable.forEach(k => {
                if (config.filtering && config.filtering.formula && config.filtering.formula(config.data[k]) === false) return;
                nbRows++;
                const trBody = tbody.appendChild(document.createElement('tr'));
                let rowScore = 0;
                let tdBodyScore = null;
                const rowBadColumns = [];
                config.columns.forEach(c => {
                    const tdBody = trBody.appendChild(document.createElement('td'));
                    if (c.property === '##score##') {
                        tdBodyScore = tdBody;
                        return;
                    }
                    if (config.showLineCount === true && c.name === '#') {
                        tdBody.innerHTML = nbRows;
                        return;
                    }
                    const row = isArray ? k : config.data[k];
                    let dataDecorated = '';
                    let dataRaw = '';
                    let additiveScore = 0;
                    try {
                        if (c.property) dataRaw = SECURITY_HANDLER.htmlSecurise(row[c.property]);
                        if (c.type && !c.formula) {
                            switch (c.type) {
                                case 'date': dataDecorated = FORMAT_HANDLER.dateFormat(dataRaw); break;
                                case 'datetime': dataDecorated = FORMAT_HANDLER.datetimeFormat(dataRaw); break;
                                case 'numeric': dataDecorated = dataRaw; break;
                            }
                        } else {
                            if (c.formula) dataDecorated = c.formula(row);
                            if (!c.formula && c.property) dataDecorated = dataRaw;
                            if (c.formula && !c.property) dataRaw = dataDecorated;
                        }
                    } catch (e) {
                        e.context = {
                            'when': 'Datatable: calling formula to render the content of a cell in the table',
                            'what': {
                                'Column': c.name,
                                'Formula': c.formula,
                                'Property': c.property,
                                'Data': row
                            }
                        }
                        throw e;
                    }
                    try {
                        if (c.scoreFormula) {
                            additiveScore = c.scoreFormula(row);
                            if (additiveScore > 0) { // ensure that the method does not return negative values! ;)
                                rowScore += additiveScore;
                                tdBody.bgColor = '#ffd079';
                                rowBadColumns.push(c.name);
                            }
                        }
                    } catch (e) {
                        e.context = {
                            'when': 'Datatable: calling scoreFormula to calculate the score of a cell in the table',
                            'what': {
                                'Column': c.name,
                                'Formula': c.scoreFormula,
                                'Current Score': rowScore,
                                'Data': row
                            }
                        }
                        throw e;
                    }
                    if (dataDecorated && dataDecorated !== '') {
                        const isArray = (Array.isArray(dataDecorated) === true);
                        if (typeof dataDecorated === 'object' && isArray === false) {
                            if (additiveScore > 0) {
                                tdBody.innerHTML = '<img src="/img/samples/flag_red.gif" alt="red flag" />&nbsp;';
                            }       
                            tdBody.appendChild(dataDecorated);
                        } else {
                            let html = '';
                            if (additiveScore > 0) {
                                html += '<img src="/img/samples/flag_red.gif" alt="red flag" />&nbsp;';
                            }
                            if (isArray === true) {
                                dataDecorated.forEach(cnt => html += cnt+'<br />');
                            } else {
                                html += dataDecorated;
                            }
                            tdBody.innerHTML = html;
                        }
                    }
                    // In case you have a formula that decorates the raw value of the cell,
                    // you want the sort feature to work on that RAW DATA instead of the 
                    // decorative version of the data
                    if (dataRaw !== dataDecorated) {
                        tdBody.setAttribute('aria-data', dataRaw?.toString());
                    }
                });
                if (tdBodyScore && rowScore > 0) {
                    const msg = 'The badness score is '+rowScore+'. Please check the column'+(rowBadColumns.length>1?'s':'')+' '+rowBadColumns+'. Thank you!';
                    tdBodyScore.innerHTML = '<img src="/img/msg_icons/error16.png" alt="'+msg+'" title="'+msg+'" />&nbsp;' + rowScore;
                    tdBodyScore.bgColor = '#ffd079';
                    trBody.bgColor = '#ffe099';
                    sumScore += rowScore;
                    nbBadRows++;
                }
            });
            if (config.showStatistics === true) {
                counters.innerHTML = 'Total number of rows: <b><code>'+nbRows+'</code></b>, Total number of bad rows: <b><code>'+
                                    nbBadRows+'</code></b>, Total sum score: <b><code>'+sumScore+'</code></b>';
            }
            if (nbRows == 0) {
                footer.innerHTML = 'No data to show.';
            } else {
                footer.innerHTML = '';
            }
            table.hidden = false; // make table visible again
            if (firstSortCallback) { 
                firstSortCallback(); 
            }
        }
    },


    /**
     * Message
     * @param configuration Object must contain 'modalContentId', 'modalId', 'warningMessageId'
     */
    MessageHandler: function (configuration) {

        const private_errors = [];

        /**
        * Show error and clean other stuff in the page
        * @param error
        */
        this.showError = function (error) {
            if (error) {
                private_errors.push(error);
                let commonHTML = '<h1 class="slds-text-heading--small"></h1><br /><br />';
                commonHTML += 'Please go <a href="https://github.com/VinceFINET/OrgCheck/issues" '+
                        'target="_blank" rel="external noopener noreferrer">here</a> and log an issue with the following information. <br /'+
                        '><br />';
                let informationHTML = '<b>OrgCheck Information</b><br />';
                informationHTML += 'Version: ' + (OrgCheck && OrgCheck.version ? OrgCheck.version : 'no version available') + '<br />';
                informationHTML += 'Installed on OrgId: ' + (OrgCheck && OrgCheck.localOrgId ? OrgCheck.localOrgId : 'no orgId available') + '<br />';
                informationHTML += 'Current running UserId: ' + (OrgCheck && OrgCheck.localUserId ? OrgCheck.localUserId : 'no userId available') + '<br />';
                informationHTML += 'Current Daily Api Requests: ' + (OrgCheck && OrgCheck.limitInfo && OrgCheck.limitInfo.DailyApiRequests ? ( 'remains: '+OrgCheck.limitInfo.DailyApiRequests.Remaining+' max:'+OrgCheck.limitInfo.DailyApiRequests.Max ) : 'no limit info available') + '<br />';
                informationHTML += '<br />';
                informationHTML += '<b>Navigation Information</b><br />';
                informationHTML += 'Page: ' + document.location.pathname + '<br />';
                informationHTML += '<br />';
                informationHTML += '<b>System Information</b><br />';
                informationHTML += 'User Agent: ' + navigator.userAgent + '<br />';
                informationHTML += 'Operating System: ' + navigator.platform + '<br />';
                informationHTML += 'Language: ' + navigator.language + '<br />';
                informationHTML += '<br />';
                private_errors.forEach((v, i) => {
                    informationHTML += '<b>Error #' + i + ': ' + v.name + '</b><br />';
                    if (v.context) {
                        informationHTML += 'When: <small><code>' + v.context.when + '</code></small><br />';
                        informationHTML += 'What:<ul class="slds-list_dotted">';
                        for (k in v.context.what) {
                            informationHTML += '<li>' + k + ': <small><code>' + v.context.what[k] + '</code></small></li>';
                        }
                        informationHTML += '</ul>';
                    }
                    if (v.stack) {
                        informationHTML += 'Stack: <br/> <small><code>' + v.stack.replace(/  at /g, '<br />&nbsp;&nbsp;&nbsp;at ') + '</code></small><br />';
                    }
                    informationHTML += '<br />';
                });
                private_show_modal(
                    'Oh no, OrgCheck had an error!', 
                    commonHTML + informationHTML.replace(/https:\/\/[^\/]*/g, '')
                );
            }
        };

        /**
        * Show dialog box with a title and content
        * @param title String title
        * @param content String html or NodeElement representing the content of the box
        */
        this.showModal = function (title, element) {
            private_show_modal(title, element);
        };

        /**
        * Show warning message
        * @param message String the message
        */
        this.showWarning = function (message) {
            const messageId = document.getElementById(configuration.warningMessageId);
            messageId.children[1].innerHTML = '<p>'+message+'</p>';
            messageId.style.display = 'flex';
        };

        /**
        * Hide warning banner and empty the message
        */
        this.hideWarning = function (message) {
            const messageId = document.getElementById(configuration.warningMessageId);
            messageId.style.display = 'none';
            messageId.children[1].innerHTML = '';
        };

        /**
        * Show the modal dialog box
        * @param element Html element to show in the modal box
        */
        function private_show_modal(title, element) {
            const header = document.getElementById(configuration.modalTitleId);
            const content = document.getElementById(configuration.modalContentId);
            header.textContent = title;
            if (content.firstElementChild) {
                content.removeChild(content.firstElementChild);
            }
            if (typeof element == 'string') {
                const span = document.createElement('span');
                span.innerHTML = element;
                content.appendChild(span);
            } else {
                content.appendChild(element);
            }
            document.getElementById(configuration.modalId).style.display = 'block';
        }
    },


    /**
     * Progress bar
     * @param configuration Object must contain 'spinnerDivId' and 'spinnerMessagesId'
     */
    ProgressBarHandler: function (configuration) {

        const SPINNER_DIV = document.getElementById(configuration.spinnerDivId);
        const SPINNER_MSG_DIV = document.getElementById(configuration.spinnerMessagesId);

        /**
        * Reset the progress bar with current value at zero and an empty message
        */
        this.reset = function () {
            SPINNER_MSG_DIV.innerHTML = '';
        };

        this.addSection = function(sectionName, message) {
            SPINNER_MSG_DIV.innerHTML += 
                '<li class="slds-progress__item" id="spinner-section-'+sectionName+'">'+
                    '<div class="slds-progress__marker"></div>'+
                    '<div class="slds-progress__item_content slds-grid slds-grid_align-spread" id="spinner-section-msg-'+sectionName+'">'+message+'</div>'+
                '</li>';
        };

        /**
        * Set the progress message with a given value
        * @param message message to display
        * @param status 'initialized', 'started', 'failed', 'ended'
        * @param section optional section name
        */
        this.setSection = function (sectionName, message, status) {
            const sections = SPINNER_MSG_DIV.getElementsByTagName('li');
            const sectionId = 'spinner-section-'+sectionName;
            const li = document.getElementById('spinner-section-'+sectionName);
            if (li) {
                li.classList.remove('slds-has-error','slds-is-completed','slds-is-active');
                switch (status) {
                    case 'started': 
                        li.classList.add('slds-is-completed');
                        li.children[0].style['border-color'] = '';
                        li.children[0].style['background-image'] = 'url(/img/loading.gif)';
                        li.children[0].style['background-size'] = '8px';
                        break;
                    case 'ended': 
                        li.classList.add('slds-is-completed'); 
                        li.children[0].style['border-color'] = 'green';
                        li.children[0].style['background-image'] = 'url(/img/func_icons/util/checkmark16.gif)';
                        li.children[0].style['background-size'] = '8px';
                        break;
                    case 'failed': 
                        li.classList.add('slds-has-error'); 
                        li.children[0].style['border-color'] = '';
                        li.children[0].style['background-image'] = 'url(/img/func_icons/remove12_on.gif)';
                        li.children[0].style['background-size'] = '8px';
                        break;
                }
            }
            const msg = document.getElementById('spinner-section-msg-'+sectionName);
            if (msg) {
                msg.innerText = message;
            }
        };

        /**
        * Hide the spinner and toast
        */
        this.hide = function () {
            SPINNER_DIV.style.display = 'none';
        };

        /**
        * Show the spinner and toast
        */
        this.show = function () {
            SPINNER_DIV.style.display = 'block';
        };
    }
}
