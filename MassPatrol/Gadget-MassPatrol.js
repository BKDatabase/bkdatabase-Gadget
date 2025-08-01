/*
SPDX-License-Identifier: BSD-2-Clause

Copyright 2022 Alex <alex@blueselene.com> (Partly modified by Waki285 <suzuneu@suzuneu.com>)

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
A script for quickly patrolling a group of changes using the API.

Sometimes, for example, when translating articles, an user may edit the same page multiple times. If you're sure that the user is not a vandal, you can quickly mark all those changes as patrolled, without having to review each individual diff.
The script was developed by "reverse-engineering" Special:RecentChanges using the Firefox element inspector, and reading https://www.mediawiki.org/wiki/API:Patrol
Note: If you find yourself using this on a editor that is obviously good-faith, consider giving them autopatrolled, or requesting that an admin give them the group.

You need the (writeapi) and (patrol) rights to use this script, as well as use the non-javascript recent changes, which can be toggled on your preferences
*/

function masspatrol(revarray, element) {
	/*
		This function is called by the masspatrol button
		It accepts 2 arguments, an array of revision ids that should be marked as patrolled, and the <a> element inside the button, as a DOMElement
		When done, this function will automatically remove the unpatrolled marks and the button
	*/
	var api = new mw.Api();
	revarray.forEach(function (item, index) {
		let params = {
			action: "patrol",
			revid: item,
			format: "json"
		};
		api.postWithToken("patrol", params).done(function (data) {
			console.log(data);
		});
	});
	/*
		We'll find the unpatrolled edits like when finding them initially.
	*/
	let button = element.parentElement; //for quickly deleting the button
	let rcentry = element.parentElement.parentElement.parentElement; //for deleting the unpatrolled mark at the page
	let edittable = element.parentElement.parentElement.parentElement.parentElement;
	/*
		Remove the unpatrolled mark on rcentry.
		
		TODO: What are the differences between this and a page that was unpatrolled since the beginning, if any?
		TODO: Better way to fix indentation
	*/
	rcentry.children[3].children[0].classList.remove("unpatrolled");
	rcentry.children[3].children[0].innerHTML = "  ";//Just removing it breaks indentation
	rcentry.children[3].children[0].attributes.removeNamedItem("title"); //"This edit has not yet been patrolled"
	rcentry.classList.remove("mw-changeslist-reviewstatus-unpatrolled");
	/*
		Now we're going to do the individual entries.
	*/
	for (var x = 1; x < edittable.childElementCount; x++) { //first element is rcentry
		try {
			if (edittable.children[x].children[3].children[0].classList.contains("unpatrolled")) {
				let childrcentry = edittable.children[x];
				childrcentry.children[3].children[0].classList.remove("unpatrolled");
				childrcentry.children[3].children[0].innerHTML = "  "; //Just removing it breaks indentation
				childrcentry.children[3].children[0].attributes.removeNamedItem("title"); //"This edit has not yet been patrolled"
			}
		} catch (e) {
			//Not an unpatrolled edit, nothing to change here
		}
	}
	/*
		And finally, the button.
	*/
	button.remove();
}

//First, we need to check if we are in Special:RecentChanges

if (mw.config.get("wgPageName") === "Special:RecentChanges") {
	let unpatrolledlist = document.getElementsByClassName("unpatrolled"); //On recent changes, the unpatrolled class is added to recent changes entries that are unpatrolled. It's also added to an element in the legend, which we'll skip
	for (var i = 1; i < unpatrolledlist.length; i++) { //First element is the element in the legend
		/*
			The unpatrolled class is added to both unpatrolled entries in pages with multiple edits, and the entries themselves. 
			The script is only interested in the first type, and discards the others by checking that the parent element's parent is the entry for a page with multiple edits, and skipping if not the case.
			
			First parent is an element containing the date and the unpatrolled element.
			Second parent is a <tr> element containing the entry, which is what we're looking for.
			On that <tr> element, we're looking for a <td> element as its second child that contains a <span> element as its first child with the class "mw-enhancedchanges-arrow".
		*/
		let item = unpatrolledlist[i];
		let rcentry = item.parentElement.parentElement;
		let revisionarray = ""; //Will be passed as parameter to masspatrol()
		if (!rcentry.innerHTML.includes("patrol all revisions")) {
			try {
				if (rcentry.children[1].children[0].classList.contains("mw-enhancedchanges-arrow")) { //Bingo
					/*
						The revisions we're looking for are in a table, which is the parent of rcentry
						We're going to retrieve the revision IDs by retrieving the "oldid" parameter in the permalinks that each entry in recent changes has
					*/
					let edittable = rcentry.parentElement;
					for (var x = 1; x < edittable.childElementCount; x++) { //first element is rcentry
						if (revisionarray.length === 0) {
							try {
								if (edittable.children[x].children[3].children[0].classList.contains("unpatrolled")) {
									let revid = new URL(edittable.children[x].children[5].children[0].children[0].attributes[0].nodeValue, mw.config.get("wgServer")).searchParams.get("oldid");
									revisionarray = revid;
								}
							} catch (e) {
								//Not an unpatrolled edit, skipping so that we don't add already patrolled edits to the list
							}
						} else {
							try {
								if (edittable.children[x].children[3].children[0].classList.contains("unpatrolled")) {
									let revid = new URL(edittable.children[x].children[5].children[0].children[0].attributes[0].nodeValue, mw.config.get("wgServer")).searchParams.get("oldid");
									revisionarray += ", " + revid;
								}
							} catch (e) {
								//Not an unpatrolled edit, skipping so that we don't add already patrolled edits to the list
							}
						}
					}
					rcentry.children[4].innerHTML += ' <span class="masspatrol-link"></span>';
					let mpLink = rcentry.children[4].querySelector(".masspatrol-link");
					mpLink.append("[");
					let mpLinkA = document.createElement("a");
					mpLinkA.addEventListener("click", function () { masspatrol(revisionarray.split(", "), mpLinkA) });
					mpLinkA.textContent = "patrol all revisions";
					mpLink.appendChild(mpLinkA);
					mpLink.append("]");
				}
			} catch (e) {
				//if we're here, that means the rcentry isn't for a page with multiple edits, or it's the rcentry itself. We're only interested in matches that are childs of the rcentry
			}
		} else {
			//We already did this rcentry on another loop, no need to repeat
		}
	}//unpatrolledlist loop
}//if Special:RecentChanges
