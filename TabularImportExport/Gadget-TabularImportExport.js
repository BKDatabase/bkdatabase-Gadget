/**
 * Copyright (c) 2017-2025 Derk-Jan Hartman [[c:User:TheDJ]]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * This script provides import and export functionality of CSV and XLSX files
 * into Commons' tabular data sets.
 *
 * Known issues:
 * - You always need to make sure your file has a header
 * - Types of imported data are a bit of guess work
 * - The localized type gets exported as the first entry for the csv/tsv
 *
 * @param $
 * @param mw
 */
( function ( $, mw ) {
	const papaScript = mw.loader.getScript( 'https://blutigeskareuz.miraheze.org/w/index.php?title=MediaWiki:PapaParse.js&action=raw&ctype=text/javascript' );
	// Thay CDN cũ bằng cdnjs bản ổn định hơn của SheetJS (XLSX)
	const xlsxScript = mw.loader.getScript( 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js' );

	const deepCopy = ( object ) => $.extend( true, {}, object );
	const deepCopyArray = ( array ) => $.extend( true, [], array );
	const addKeysToSet = ( set, obj ) => {
		Object.keys( obj ).forEach( ( key ) => set.add( key ) );
	};
	const isNonNullObject = ( value ) => typeof value === 'object' && value !== null;

	function saveAs( blob, filename ) {
		const url = URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.style.display = 'none';
		a.href = url;
		a.download = filename || 'download';
		document.body.appendChild( a );
		a.click();
		setTimeout( () => {
			document.body.removeChild( a );
			URL.revokeObjectURL( url );
		}, 1000 );
	}

	function Workbook() {
		if ( !( this instanceof Workbook ) ) {
			return new Workbook();
		}
		this.SheetNames = [];
		this.Sheets = {};
	}

	const i18n = {
		'gadget-tabular-import-placeholder': 'A .csv or .xlsx file to import',
		'gadget-tabular-export-csv': 'Export to CSV',
		'gadget-tabular-export-excel': 'Export to Excel',
		'gadget-tabular-unsupported-file': 'Unsupported file type. Please select either a .csv or .xlsx file.',
		'gadget-tabular-import-failed': 'Unable to import file: $1',
		'gadget-tabular-description-placeholder': 'Please enter a description',
		'gadget-tabular-importing-summary': 'Importing data $1',
		'gadget-tabular-imported-from': 'Imported from file $1 $2'
	};

	class TabularImportExport {
		constructor() {
			this.selectFileWidget = null;
			this.api = null;
		}

		install() {
			this.api = new mw.Api();
			if ( [ 'edit', 'submit' ].includes( mw.config.get( 'wgAction' ) ) ) {
				this.selectFileWidget = new OO.ui.SelectFileInputWidget( { placeholder: mw.msg( 'gadget-tabular-import-placeholder' ) } );
				this.selectFileWidget.on( 'change', this.selectFile.bind( this ) );
				$( '#editform:not([readonly])' ).before( this.selectFileWidget.$element );
			} else if ( mw.config.get( 'wgAction' ) === 'view' ) {
				const button1 = new OO.ui.ButtonWidget( { label: mw.msg( 'gadget-tabular-export-csv' ) } );
				button1.on( 'click', () => this.fetchData( 'csv' ) );
				const button2 = new OO.ui.ButtonWidget( { label: mw.msg( 'gadget-tabular-export-excel' ) } );
				button2.on( 'click', () => this.fetchData( 'excel' ) );
				const layout = new OO.ui.HorizontalLayout( {
					items: [
						button1,
						button2
					]
				} );
				$( '#mw-content-text' ).append( layout.$element );

				const skin = mw.config.get( 'skin' );
				let portletId = 'p-tb';
				if ( skin === 'monobook' ) {
					portletId = 'p-cactions';
				} else if ( skin === 'vector' || skin === 'vector-2022' ) {
					portletId = 'p-electronpdfservice-sidebar-portlet-heading';
				}

				$( mw.util.addPortletLink( portletId, '', mw.msg( 'gadget-tabular-export-csv', 't-tiec' ) ) ).on( 'click', ( e ) => {
					this.fetchData( 'csv' );
					e.preventDefault();
				} );
				$( mw.util.addPortletLink( portletId, '', mw.msg( 'gadget-tabular-export-excel', 't-tiee' ) ) ).on( 'click', ( e ) => {
					this.fetchData( 'excel' );
					e.preventDefault();
				} );
			}
		}

		fetchData( type ) {
			const apiRequest = this.api.get( {
				action: 'query',
				formatversion: 2,
				format: 'json',
				prop: 'revisions',
				rvprop: 'ids|user|content|timestamp',
				rvslots: 'main',
				titles: mw.config.get( 'wgPageName' )
			} );

			$.when( apiRequest, papaScript, xlsxScript ).then( ( apiResponse ) => {
				let jsondata;
				const query = apiResponse[ 0 ] && apiResponse[ 0 ].query;
				const page = query && query.pages && query.pages[ 0 ];
				const rev = page && page.revisions && page.revisions[ 0 ];

				if ( rev && rev.slots && rev.slots.main && rev.slots.main.content ) {
					try {
						jsondata = JSON.parse( rev.slots.main.content );
					} catch ( e ) {
						OO.ui.alert( 'Could not parse tabular data: ' + e );
						return;
					}
				}

				if ( !jsondata ) {
					OO.ui.alert( 'Could not find tabular data' );
					return;
				}

				if ( type === 'csv' ) {
					this.exportToCSV( jsondata, page );
				} else if ( type === 'excel' ) {
					this.exportToExcel( jsondata, page );
				}
			} );
		}

		exportToExcel( jsondata, pageData ) {
			const workbook = this.convertToExcel( jsondata, pageData );
			const wopts = { bookType: 'xlsx', bookSST: false, type: 'array', charset: 'utf-8', cellDates: true, cellStyles: true };
			XLSX.writeFile( workbook, `${ mw.config.get( 'wgTitle' ) }.xlsx`, wopts );
		}

		exportToCSV( jsondata, pageData ) {
			const csvdata = { fields: [], data: [] };
			jsondata.schema.fields.forEach( ( element ) => {
				csvdata.fields.push( element.name );
			} );

			jsondata.data.forEach( ( row ) => {
				const rowArray = [];
				row.forEach( ( xElement, xIndex ) => {
					if ( jsondata.schema.fields[ xIndex ].type === 'localized' && typeof xElement === 'object' && xElement !== null ) {
						rowArray.push( Object.values( xElement )[ 0 ] );
					} else {
						rowArray.push( xElement );
					}
				} );
				csvdata.data.push( rowArray );
			} );

			const csv = Papa.unparse( csvdata );
			const blob = new Blob( [ csv ], { type: 'text/csv' } );
			saveAs( blob, `${ mw.config.get( 'wgTitle' ) }.csv` );
		}

		convertToExcel( jsondata, pageData ) {
			const wb = new Workbook();
			const dataArray = [ [] ];
			const localizedIndices = [];
			const languageCodes = new Set();

			jsondata.schema.fields.forEach( ( field, idx ) => {
				dataArray[ 0 ].push( field.name );
				// Kiểm tra an toàn trước khi lấy keys
				if ( isNonNullObject( field.title ) ) {
					addKeysToSet( languageCodes, field.title );
				}
				if ( field && field.type === 'localized' ) {
					localizedIndices.push( idx );
				}
			} );

			jsondata.data.forEach( ( row ) => {
				const copyOfRow = deepCopyArray( row );
				localizedIndices.forEach( ( idx ) => {
					if ( isNonNullObject( copyOfRow[ idx ] ) ) {
						addKeysToSet( languageCodes, copyOfRow[ idx ] );
						copyOfRow[ idx ] = Object.values( copyOfRow[ idx ] )[ 0 ];
					}
				} );
				dataArray.push( copyOfRow );
			} );

			const ws = XLSX.utils.aoa_to_sheet( dataArray );
			const ws_name = mw.config.get( 'wgTitle' )
				.replace( /[/\\*'?[\]:]/g, ' ' )
				.toLowerCase()
				.slice( 0, 31 );
			ws[ '!merges' ] = [];
			wb.SheetNames.push( ws_name );
			wb.Sheets[ ws_name ] = ws;

			const copyDataWithReferences = ( dArray, dSheetName ) => {
				return dArray.map( ( row, i ) => {
					return row.map( ( cell, j ) => {
						const cellName = XLSX.utils.encode_cell( { r: i, c: j } );
						return { f: `'${ dSheetName }'!${ cellName }` };
					} );
				} );
			};

			// Hàm được sửa lỗi null-check an toàn tại đây
			function createTranslatedArrayOfArrays( tDataArray, lang ) {
				jsondata.schema.fields.forEach( ( field, idx ) => {
					// An toàn hóa field.title nếu nó là null, undefined hoặc string
					const titleObj = isNonNullObject( field.title ) ? field.title : {};
					const entries = Object.entries( titleObj );
					const firstEntry = entries.length > 0 ? entries[ 0 ] : [ '', field.name || '' ];

					const cellValue = titleObj[ lang ] || firstEntry[ 1 ] || field.name || '';
					const cellLanguage = titleObj[ lang ] ? lang : ( firstEntry[ 0 ] || '' );
					const cell = { v: cellValue, c: [ { a: 'localized', t: cellLanguage, hidden: true } ] };
					tDataArray[ 0 ][ idx ] = cell;
				} );

				jsondata.data.forEach( ( row, rowIndex ) => {
					localizedIndices.forEach( ( idx ) => {
						const cellObj = row[ idx ];
						if ( isNonNullObject( cellObj ) ) {
							const entries = Object.entries( cellObj );
							const firstEntry = entries.length > 0 ? entries[ 0 ] : [ '', '' ];

							const cellValue = cellObj[ lang ] || firstEntry[ 1 ] || null;
							const cellLanguage = cellObj[ lang ] ? lang : ( firstEntry[ 0 ] || '' );
							const cell = { v: cellValue, c: [ { a: 'localized', t: cellLanguage, hidden: true } ] };
							tDataArray[ rowIndex + 1 ][ idx ] = cell;
						}
					} );
				} );
				return tDataArray;
			}

			const dataArrayWithReferences = copyDataWithReferences( dataArray, ws_name );

			[ ...languageCodes ].sort().forEach( ( lang ) => {
				const langSheetName = lang;
				const langWs = XLSX.utils.aoa_to_sheet( createTranslatedArrayOfArrays( deepCopyArray( dataArrayWithReferences ), lang ) );
				wb.SheetNames.push( langSheetName );
				wb.Sheets[ langSheetName ] = langWs;
			} );

			const pageUrl = new URL( mw.config.get( 'wgArticlePath' ).replace( '$1', pageData.title ), window.location );
			const historyUrl = new URL( mw.config.get( 'wgScript' ), window.location );
			historyUrl.searchParams.set( 'title', pageData.title );
			historyUrl.searchParams.set( 'action', 'history' );

			wb.Props = {
				Title: pageData.title,
				Company: mw.config.get( 'wgSiteName' ),
				SheetNames: wb.SheetNames,
				Worksheets: wb.SheetNames.length
			};

			wb.Custprops = {
				Revision: pageData.revisions[ 0 ].revid,
				LastModified: pageData.revisions[ 0 ].timestamp,
				Url: pageUrl.toString(),
				Contributors: historyUrl.toString(),
				Sources: jsondata.sources || '',
				LicenseCode: jsondata.license,
				Software: 'Tabular Import/Export-gadget'
			};

			for ( const language in jsondata.description ) {
				wb.Custprops[ `Description.${ language }` ] = jsondata.description[ language ];
			}

			if ( jsondata.mediaWikiCategories && jsondata.mediaWikiCategories.length > 0 ) {
				wb.Custprops.MediaWikiCategories = jsondata.mediaWikiCategories.map( ( cat ) => {
					let str = 'Category:' + cat.name;
					if ( cat.sort ) {
						str += '|' + cat.sort;
					}
					return str;
				} ).join( ', ' );
			}

			return wb;
		}

		selectFile() {
			const selectedFile = this.selectFileWidget.getValue();
			if ( !selectedFile ) return;
			const name = selectedFile.name;

			$.when( papaScript, xlsxScript ).then( () => {
				if ( name.endsWith( '.csv' ) || name.endsWith( '.tsv' ) || name.endsWith( '.txt' ) ) {
					this.importCSVFile( selectedFile );
				} else if ( name.endsWith( '.xlsx' ) || name.endsWith( '.xlsb' ) || name.endsWith( '.xls' ) || name.endsWith( '.ods' ) ) {
					selectedFile.arrayBuffer().then( ( buffer ) => {
						const workbook = XLSX.read( buffer, { type: 'array', dense: true, charset: 'utf-8' } );
						this.importXLSX( workbook );
					} );
				} else {
					OO.ui.alert( mw.msg( 'gadget-tabular-unsupported-file' ) );
				}
			} );
		}

		importCSVFile( file ) {
			Papa.parse( file, {
				header: true,
				dynamicTyping: true,
				complete: this.importCSV.bind( this ),
				error: this.importCSVFailed.bind( this ),
				encoding: 'utf-8'
			} );
		}

		importCSV( csvdata ) {
			const jsondata = {
				schema: { fields: [] },
				data: []
			};

			csvdata.meta.fields.forEach( ( columnName ) => {
				jsondata.schema.fields.push( {
					name: columnName.replace( /\W/g, '' ),
					type: 'string',
					title: {
						en: columnName
					}
				} );
			} );

			csvdata.data.forEach( ( row ) => {
				const columnData = [];
				csvdata.meta.fields.forEach( ( columnName ) => {
					columnData.push( row[ columnName ] === '' ? null : row[ columnName ] );
				} );
				jsondata.data.push( columnData );
			} );

			this.writeTextbox( jsondata );
		}

		importCSVFailed( error ) {
			OO.ui.alert( mw.msg( 'gadget-tabular-import-failed', error ) );
		}

		importXLSX( workbook ) {
			const jsondata = {
				schema: { fields: [] },
				data: []
			};

			if ( workbook.Custprops ) {
				if ( workbook.Custprops.LicenseCode ) {
					jsondata.license = workbook.Custprops.LicenseCode;
				}
				if ( workbook.Custprops.Sources ) {
					jsondata.sources = workbook.Custprops.Sources;
				}
				Object.entries( workbook.Custprops ).forEach( ( [ key, value ] ) => {
					if ( key.startsWith( 'Description.' ) ) {
						const lang = key.slice( 'Description.'.length );
						if ( !jsondata.description ) {
							jsondata.description = {};
						}
						jsondata.description[ lang ] = value;
					}
				} );
				if ( workbook.Custprops.MediaWikiCategories ) {
					jsondata.mediaWikiCategories = workbook.Custprops.MediaWikiCategories.split( ', ' ).map( ( catStr ) => {
						const [ name, sort ] = catStr.replace( /^Category:/, '' ).split( '|' );
						const category = { name };
						if ( sort ) {
							category.sort = sort;
						}
						return category;
					} );
				}
			}

			const sheet = workbook.Sheets[ workbook.SheetNames[ 0 ] ];
			const jsonsheet = XLSX.utils.sheet_to_json( sheet, { raw: true, defval: null } );

			if ( jsonsheet.length < 1 ) {
				return;
			}

			for ( const header in jsonsheet[ 0 ] ) {
				jsondata.schema.fields.push( {
					name: header.replace( /\W/g, '' ),
					type: 'string',
					title: {
						en: header
					}
				} );
			}

			jsonsheet.forEach( ( row ) => {
				const rowData = [];
				for ( const header in jsonsheet[ 0 ] ) {
					let cell = row[ header ];
					if ( cell === undefined || cell === '' ) {
						cell = null;
					}
					rowData.push( cell );
				}
				jsondata.data.push( rowData );
			} );

			// Sửa lỗi duyệt đa ngôn ngữ sheet: Chuyển sheet thành mảng dữ liệu AOA trước khi duyệt
			if ( workbook.SheetNames.length > 1 ) {
				workbook.SheetNames.forEach( ( name ) => {
					const sheetObj = workbook.Sheets[ name ];
					if ( !sheetObj || sheetObj[ '!type' ] !== undefined ) return;

					const sheetData = XLSX.utils.sheet_to_json( sheetObj, { header: 1, defval: null } );
					sheetData.forEach( ( row, i ) => {
						if ( !Array.isArray( row ) ) return;
						row.forEach( ( cell, j ) => {
							if ( cell && typeof cell === 'object' && cell.c && cell.c[ 0 ] && cell.c[ 0 ].a === 'localized' && cell.c[ 0 ].t === name ) {
								if ( i === 0 ) {
									if ( jsondata.schema.fields[ j ] && jsondata.schema.fields[ j ].title ) {
										jsondata.schema.fields[ j ].title[ name ] = cell.v;
									}
									return;
								}
								const targetRowIdx = i - 1;
								if ( jsondata.data[ targetRowIdx ] ) {
									if ( typeof jsondata.data[ targetRowIdx ][ j ] === 'object' && jsondata.data[ targetRowIdx ][ j ] !== null ) {
										jsondata.data[ targetRowIdx ][ j ][ cell.c[ 0 ].t ] = cell.v;
									} else {
										jsondata.data[ targetRowIdx ][ j ] = { [ cell.c[ 0 ].t ]: cell.v };
									}
								}
							}
						} );
					} );
				} );
			}

			this.writeTextbox( jsondata );
		}

		writeTextbox( jsondata ) {
			const selectFileWidget = this.selectFileWidget;
			const selectedFile = selectFileWidget && selectFileWidget.getValue ? selectFileWidget.getValue() : { name: '' };

			const firstRow = jsondata.data[ 0 ] || [];
			firstRow.forEach( ( columnEl, index ) => {
				if ( typeof columnEl === 'number' ) {
					jsondata.schema.fields[ index ].type = 'number';
				} else if ( typeof columnEl === 'boolean' ) {
					jsondata.schema.fields[ index ].type = 'boolean';
				}
			} );

			const username = mw.config.get( 'wgUserName' );
			const formattedUsername = username ?
				`by ${ mw.config.get( 'wgFormattedNamespaces' )[ mw.config.get( 'wgNamespaceIds' ).user ] }:${ username }` :
				'';
			const metadata = {
				license: 'CC0-1.0',
				description: {
					en: mw.msg( 'gadget-tabular-description-placeholder' )
				},
				sources: mw.msg( 'gadget-tabular-imported-from', selectedFile ? selectedFile.name : '', formattedUsername )
			};

			const merged = $.extend( metadata, jsondata );
			$( '#wpTextbox1' ).textSelection( 'setContents', JSON.stringify( merged, null, '\t' ) );
			$( '#wpSummary' ).val( mw.msg( 'gadget-tabular-importing-summary', selectedFile ? selectedFile.name : '' ) );
		}
	}

	if ( mw.config.get( 'wgNamespaceNumber' ) === 486 && ( mw.config.get( 'wgTitle' ).endsWith( '.tab' ) || mw.config.get( 'wgTitle' ).endsWith( '.tabx' ) ) ) {
		mw.messages.set( i18n );
		$.when(
			mw.loader.using( [
				'oojs-ui', 'oojs-ui-core', 'oojs-ui-widgets', 'mediawiki.api', 'jquery.textSelection'
			] ),
			$.ready
		).then( () => {
			const tabularImportExport = new TabularImportExport();
			tabularImportExport.install();
		} );
	}
}( jQuery, mediaWiki ) );