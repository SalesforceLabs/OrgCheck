// Dependencies with:
// - OrgCheck.DataTypes.String.Handler.htmlSecurise() <-- STRING_HANDLER.htmlSecurise()
// - OrgCheck.DataTypes.Date.Handler.dateFormat() <-- DATE_HANDLER.dateFormat()
// - OrgCheck.DataTypes.Date.Handler.datetimeFormat() <-- DATE_HANDLER.datetimeFormat()

/**
 * Visual Components
 */
OrgCheck.VisualComponents = {

    /**
     * Datatable decorator
     * @param handlers JSON configuration including:
     *              <ol>
     *                <li><code>StringHandler</code> including method <code>htmlSecurise</code></li>
     *                <li><code>DateHandler</code> including method <code>dateFormat</code> and <code>datetimeFormat</code></li>
     *                <li><code>MessageHandler</code> including method <code>showModal</code></li>
     *                <li><code>HtmlTagHandler</code> including method <code>checkbox</code></li>
     *              </ol>
     */
    DatatableHandler: function(handlers) { 
     
        const STRING_HANDLER = handlers.StringHandler;
        const DATE_HANDLER = handlers.DateHandler;
        const MSG_HANDLER = handlers.MessageHandler;
        const HTMLTAG_HANDLER = handlers.HtmlTagHandler;

        /**
         * Creates a datatable
         * @param config JSON configuration including:
         *              <ol>
         *                <li><code>element</code>: name of the root element where the table will be added as a child node.</li>
         *                <li><code>showSearch</code>: boolean, if <code>true</code>, show a search box, <code>false</code> by default.</li>
         *                <li><code>showStatistics</code>: boolean, if <code>true</code>, show some stats at the top, <code>false</code> by default.</li>
         *                <li><code>showLineCount</code>: boolean, if <code>true</code>, show an additional '#' column with line count, <code>false</code> by default.</li>
         *                <li><code>showSelection</code>: boolean, if <code>true</code>, show an additional 'checkbox' column to perform actions, <code>false</code> by default.</li>
         *                <li><code>appendCountInElement</code>: name of the element that will contain the counter of bad lines and total lines of this table</li>
         *                <li><code>columns</code>: array[JSON], description of each column of the datatable</li>
         *                <li><code>sorting</code>: JSON, describe which initial column will be used to sort data.</li>
         *                <li><code>data</code>: array[JSON], data of the table (as a map with Id as index)</li>
         *                <li><code>filtering</code>: JSON, description of an optional filter to apply to the visual representation.</li>
         *                <li><code>preprocessing</code>: JSON, description of an optional method that will process the row at once and potentially set once massive amount of data (like the dependencies).</li>
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
                main = main.appendChild(document.createElement('div'));
                main.classList.add('slds-scrollable');
                main.style.height = '100%';
                main.style.width = 'fit-content';
            }

            const table = main.appendChild(document.createElement('table'));
            const thead = table.appendChild(document.createElement('thead'));
            const tbody = table.appendChild(document.createElement('tbody'));

            const trHeadShadow = config.stickyHeaders ? tbody.appendChild(document.createElement('tr')) : null;
            if (trHeadShadow) {
                trHeadShadow.style.visibility = 'collapse';
            }

            table.classList.add('slds-table', 'slds-table_bordered');
            if (config.columnBordered) {
                table.classList.add('slds-table_col-bordered');
            }
            if (config.stickyHeaders) {
                table.classList.add('slds-table_header-fixed');
            }

            // Add all columns
            
            const trHead = thead.appendChild(document.createElement('tr'));
            if (config.showLineCount === true) config.columns.unshift({ name: '#' });
            if (config.showSelection) config.columns.unshift({ name: 'Select' });
            const orderingImage = document.createElement('span');
            let firstSortCallback;
            config.columns.forEach((c, i) => {
                const thHead = trHead.appendChild(document.createElement('th'));
                thHead.setAttribute('scope', 'col');
                thHead.setAttribute('aria-label', c.name);
                thHead.classList.add('slds-is-sortable');
                switch (c.orientation) {
                    case 'vertical': thHead.classList.add('orgcheck-table-th-vertical'); break;
                    case 'horizontal-bottom': thHead.classList.add('orgcheck-table-th-horizontal-bottom'); break;
                } 
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
                if (trHeadShadow) {
                    trHeadShadow.appendChild(document.createElement('th')).textContent = c.name;
                }
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
                            orderingImage.innerHTML = '&nbsp;🔼';
                        } else {
                            thHead.setAttribute('aria-sort', 'descending');
                            orderingImage.innerHTML = '&nbsp;🔽';
                        }
                        grdHead.appendChild(orderingImage);
                        const iOrder = config.sorting.order === 'asc' ? 1 : -1;
                        const items = [].slice.call(table.rows).slice(1);
                        const isCellNumeric = c.type === 'numeric';
                        const size = items.length;
                        items.sort(function compare(a, b) {
                            const ca = a.getElementsByTagName('td')[i];
                            const cb = b.getElementsByTagName('td')[i];
                            if (ca && cb) {
                                const va = ca.hasAttribute('aria-data') ? ca.getAttribute('aria-data') : ca.textContent;
                                const vb = cb.hasAttribute('aria-data') ? cb.getAttribute('aria-data') : cb.textContent;
                                if (isCellNumeric) {
                                    if (va === '') return size;
                                    if (vb === '') return -size;
                                    if (va && vb) return (va - vb) * iOrder;
                                    if (va) return iOrder;
                                    if (vb) return -iOrder;
                                    return 0;
                                }
                                if (va < vb) return -iOrder;
                                if (va > vb) return iOrder;
                                return 0;
                            }
                        });
                        table.hidden = true; // make table invisible while manipulating the DOM
                        let countRow = 1;
                        items.forEach(r => {
                            const parent = r.parentNode;
                            const detatchedItem = parent.removeChild(r);
                            parent.appendChild(detatchedItem);
                            if (config.showLineCount === true && !detatchedItem.style.visibility) {
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
            table.hidden = true; // make table invisible while manipulating the DOM
            if (config.showSelection) {
                table.style = 'cursor: pointer;';
            }
            let nbRows = 0, nbBadRows = 0, sumScore = 0;
            if (iterable) iterable.forEach(k => {
                if (config.filtering && config.filtering.formula && config.filtering.formula(config.data[k]) === false) return;
                nbRows++;
                const trBody = tbody.appendChild(document.createElement('tr'));
                let rowScore = 0;
                let tdBodyScore = null;
                const rowBadColumns = [];
                const row = isArray ? k : config.data[k];
                const preprocessedRow = config.preprocessing ? config.preprocessing(row) : undefined;
                config.columns.forEach(c => {
                    const tdBody = trBody.appendChild(document.createElement('td'));
                    if (c.property === '##score##') { tdBodyScore = tdBody; return; }
                    if (config.showLineCount === true && c.name === '#') { tdBody.innerHTML = nbRows; return; }
                    if (config.showSelection && c.name === 'Select') {
                        tdBody.setAttribute('aria-data', false);
                        const select = tdBody.appendChild(document.createElement('input'));
                        select.setAttribute('type', 'checkbox');
                        select.onclick = (e) => {
                            config.showSelection.onselect(row, e.target.checked);
                            tdBody.setAttribute('aria-data', e.target.checked);
                        };
                        trBody.onclick = (e) => {
                            if (e.target != select) select.click();
                        };
                        return;
                    }
                    let dataDecorated = '';
                    let dataRaw = '';
                    let additiveScore = 0;
                    try {
                        if (c.property) dataRaw = STRING_HANDLER.htmlSecurise(row[c.property]);
                        if (c.type && !c.formula) {
                            switch (c.type) {
                                case 'date': dataDecorated = DATE_HANDLER.dateFormat(dataRaw); break;
                                case 'datetime': dataDecorated = DATE_HANDLER.datetimeFormat(dataRaw); break;
                                case 'numeric': dataDecorated = ''+dataRaw; break;
                                case 'checkbox': dataDecorated = HTMLTAG_HANDLER.checkbox(dataRaw);
                            }
                        } else {
                            if (c.formula) dataDecorated = c.formula(row, preprocessedRow);
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
                            additiveScore = c.scoreFormula(row, preprocessedRow);
                            if (additiveScore > 0) { // ensure that the method does not return negative values! ;)
                                rowScore += additiveScore;
                                tdBody.classList.add('orgcheck-table-td-badcell');
                                rowBadColumns.push({c: c.name, s: additiveScore, d: dataDecorated});
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
                            tdBody.appendChild(dataDecorated);
                        } else {
                            let html = '';
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
                    let msg = 'The badness score for this row is <b>'+rowScore+'</b><ul class="slds-list_dotted">';
                    rowBadColumns.forEach(i => msg += '<li>For <b>'+i.c+'</b> you had <b>'+i.d+'</b> (<code>+'+i.s+'</code> to the score)</li>');
                    msg += '</ul><br /><br />The data for this row is: <br /><pre>'+JSON.stringify(row, null, " ")+'</pre>';
                    tdBodyScore.innerHTML = rowScore;
                    tdBodyScore.onclick = () => {
                        MSG_HANDLER.showModal('Why do I have this score for row #'+k+'?', msg);
                    }
                    tdBodyScore.classList.add('orgcheck-table-td-badscore');
                    trBody.classList.add('orgcheck-table-tr-badrow');
                    sumScore += rowScore;
                    nbBadRows++;
                }
            });
            if (config.showStatistics === true) {
                counters.innerHTML = 'Total number of rows: <b><code>'+nbRows+'</code></b>, Total number of bad rows: <b><code><font color="red">'+
                                    nbBadRows+'</font></code></b>, Total sum score: <b><code>'+sumScore+'</code></b>';
            }
            if (nbRows == 0) {
                footer.innerHTML = 'No data to show.';
            } else {
                footer.innerHTML = '';
            }
            if (config.appendCountInElement) {
                const countElement = document.getElementById(config.appendCountInElement)
                if (countElement && nbBadRows > 0) {
                    // Warning: do not add any html tag here, if not the link on the tab won't work on them... Thank you!
                    countElement.innerHTML += ' (' + nbBadRows + HTMLTAG_HANDLER.icon('redPin')+')';
                }
            }
            table.hidden = false; // make table visible again
            if (firstSortCallback) { 
                firstSortCallback(); 
            }
        }
    },


    /**
     * HTML Tag decorator 
     */
    HtmlTagHandler: function() {

        this.image = function(name) {
            switch (name) {
                case 'greenFlag':  return '/img/samples/flag_green.gif';
                case 'redFlag':    return '/img/samples/flag_red.gif';
                case 'group':      return '/img/icon/groups24.png';
                case 'user':       return '/img/icon/alohaProfile16.png';
                case 'star0':      return '/img/samples/stars_000.gif';
                case 'star1':      return '/img/samples/stars_100.gif';
                case 'star2':      return '/img/samples/stars_200.gif';
                case 'star3':      return '/img/samples/stars_300.gif';
                case 'star4':      return '/img/samples/stars_400.gif';
                case 'star5':      return '/img/samples/stars_500.gif';
                case 'org':        return '/img/msg_icons/confirm16.png';
                case 'checked':    return '/img/samples/rating5.gif';                
                case 'unchecked':  return '/img/samples/rating3.gif';
                case 'redPin':     return '/img/samples/rating1.gif';
                default:           return '';
            }
        };

        this.checkbox = function(b) {
            return this.icon(b === true ? 'checked' : 'unchecked');
        };

        this.link = function(endpoint, uri, content) {
            return '<a href="' + endpoint + uri + '" target="_blank" rel="external noopener noreferrer">' + content + '</a>';
        };

        this.icon = function(name) {
            return '<img src="'+this.image(name)+'" alt="'+name+'" title="'+name+'" style="vertical-align: inherit;" />';
        };

        this.color = function(label) {
            switch (label) {
                case 'highlight':    return '#ffe099';
                case 'dark-blue':    return '#147efb';
                case 'blue':         return '#5fc9f8';
                case 'dark-orange':  return '#fd9426';
                case 'orange':       return '#fecb2e';
                case 'light-gray':   return '#bfc9ca';
                case 'gray':         return '#555555';
                default:             return 'red';
            }
        };
    },


    /**
     * Message decorator
     * @param configuration Object must contain 'modalContentId', 'modalImageId', 'modalId', 'warningMessagesId'
     */
    MessageHandler: function (configuration) {

        const private_errors = [];

        /**
        * Show error and clean other stuff in the page
        * @param error
        * @param displayIssueInformation
        * @param salesforceInfo
        * @param imageTitle
        * @param textTitle
        */
        this.showError = function (error, displayIssueInformation, salesforceInfo, imageTitle, textTitle) {
            if (error) {
                try {
                    private_errors.push(error);
                    let commonHTML = '<h1 class="slds-text-heading--small"></h1><br /><br />';
                    if (displayIssueInformation === true) {
                        commonHTML += 'Please go <a href="https://github.com/SalesforceLabs/OrgCheck/issues" '+
                            'target="_blank" rel="external noopener noreferrer">here</a> and log an issue with the following information. <br /'+
                            '><br />';
                    }
                    let informationHTML = '';
                    if (salesforceInfo) {
                        informationHTML += '<b>Salesforce Information</b><br />';
                        informationHTML += 'Salesforce API Version: ' + salesforceInfo.getApiVersion() + '<br />';
                        informationHTML += 'Installed on OrgId: ' + salesforceInfo.getOrgId() + '<br />';
                        informationHTML += 'Type of this org: ' + salesforceInfo.getOrgType() + '<br />';
                        informationHTML += 'Current running UserId: ' + salesforceInfo.getCurrentUserId() + '<br />';
                        informationHTML += 'Current Daily Api Requests: ' + JSON.stringify(salesforceInfo.getLimitApiDailyRequest()) + '<br />';
                        informationHTML += '<br />';
                    }
                    if (displayIssueInformation === true) {
                        informationHTML += '<b>Navigation Information</b><br />';
                        informationHTML += 'Page: ' + document.location.pathname + '<br />';
                        informationHTML += '<br />';
                        informationHTML += '<b>System Information</b><br />';
                        informationHTML += 'Language: ' + navigator.language + '<br />';
                        informationHTML += '<br />';
                    }
                    private_errors.forEach((v, i) => {
                        informationHTML += '<b>Issue #' + i + ': ' + v.name + '</b><br />';
                        if (v.context) {
                            informationHTML += 'When: <small><code>' + v.context.when + '</code></small><br />';
                            informationHTML += 'What:<ul class="slds-list_dotted">';
                            for (let k in v.context.what) {
                                const value = v.context.what[k];
                                informationHTML += '<li>' + k + ': <small><code>' + (typeof value === 'object' ? JSON.stringify(value) : value) + '</code></small></li>';
                            }
                            informationHTML += '</ul>';
                        }
                        if (displayIssueInformation === true && v.stack) {
                            informationHTML += 'Stack: <br/> <small><code>' + v.stack.replace(/ {2}at /g, '<br />&nbsp;&nbsp;&nbsp;at ') + '</code></small><br />';
                            console.error('Org Check - Error #' + i, v);
                        }
                        informationHTML += '<br />';
                    });
                    private_show_modal(
                        textTitle || 'Oh no, Org Check had an error!', 
                        commonHTML + informationHTML.replace(/https:\/\/[^/]*/g, ''),
                        imageTitle || '/img/msg_icons/error32.png'
                    );
                } catch (e) {
                    // Just in case we have an error during the showError!!
                    console.error(e);
                }
            }
        };

        /**
        * Show dialog box with a title and content
        * @param title String title
        * @param content String html or NodeElement representing the content of the box
        * @param image the icon or image to show on this modal (optional)
        */
        this.showModal = function (title, element, image) {
            private_show_modal(title, element, image);
        };

        /**
        * Show warning message
        * @param message String or Array<String> the message(s)
        */
        this.showWarning = function (message) {
            const messages = (Array.isArray(message) ? message : [ message ]); 
            //const nbMessages = messages.length;
            const warningsDiv = document.getElementById(configuration.warningMessagesId);
            messages.forEach((msg, idx) => {
                let warningDiv = warningsDiv.children[0];
                if (idx > 0) {
                    warningDiv = warningsDiv.appendChild(warningDiv.cloneNode(true));
                    warningDiv.style['border-top-style'] = 'dotted';
                }
                warningDiv.children[1].innerHTML = '<p>'+msg+'</p>';
            });
            warningsDiv.style.display = 'block';
        };

        /**
        * Hide warning banner and empty the message
        */
        this.hideWarning = function () {
            const warningsDiv = document.getElementById(configuration.warningMessagesId);
            warningsDiv.style.display = 'none';
            // remove previous additional messages (keep the first one only)
            for (let i=1; i<warningsDiv.childElementCount; i++) {
                warningsDiv.removeChild(warningsDiv.lastChild);
            }
        };

        /**
        * Show the modal dialog box
        * @param title
        * @param element Html element to show in the modal box
        * @param image Optional image to show in the modal box on the left
        */
        function private_show_modal(title, element, image) {
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
            if (image) {
                const imagediv = document.getElementById(configuration.modalImageId);
                if (imagediv.firstElementChild) {
                    imagediv.removeChild(imagediv.firstElementChild);
                }
                if (typeof image == 'string') {
                    const img = document.createElement('img');
                    img.src = image;
                    imagediv.appendChild(img);
                } else {
                    imagediv.appendChild(image);
                }
            }
            document.getElementById(configuration.modalId).style.display = 'block';
        }
    },


    /**
     * Progress bar decorator
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
