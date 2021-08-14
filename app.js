function escapeHTML(html) {
    return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function clobberer(target, href) {
    let res = [];

    if (target.length === 1) {
        res = res.concat([
            `<a id="${target[0]}"${href ? ` href="${href}"` : ''}>CLOBBERED</a>`,
            `<img name="${target[0]}" />`
        ]);
    } else if (target.length === 2) {
        if (target[0] === 'document')
            return res.concat([`<img name="${target[1]}">`]);
        else if (target[0] === 'window')
            return res.concat([
                `<a id="${target[1]}"${href ? ` href="${href}"` : ''}>CLOBBERED</a>`,
                `<img name="${target[1]}" />`
            ]);
        else
            res = res.concat([
                `<a id="${target[0]}"></a>\n<a id="${target[0]}" name="${target[1]}"${href ? ` href="${href}"` : ''}>CLOBBERED</a>`,
                `<form id="${target[0]}"><input name="${target[1]}"></form>`
            ]);
    } else if (target.length === 3) {
        res = res.concat([
            `<form id="${target[0]}">\n<form id="${target[0]}" name="${target[1]}">\n  <input name="${target[2]}">\n</form>`
        ]);
    }

    const toIframe = (target, nth) => {
        if (nth === target.length - 1)
            return `<a id='${target[nth]}'${href ? ` href='${href}'` : ''}></a>`

        let html = `<iframe name=${target[nth]} srcdoc="\n${"  ".repeat(nth + 1) + toIframe(target, nth + 1) + "\n" + "  ".repeat(nth)}"></iframe>`;

        if (nth === 1) html = html.replace(/"/g, '&quot;')
        else if (nth > 1) html = html.replace(/"/g, '&quot;').replace(/&/g, "&amp;");

        return html;
    }

    if (target.length > 1) res = res.concat(toIframe(target, 0));
    return res;
}

window.onload = form.targetObject.oninput = form.customHrefValue.onchange = form.hrefValue.oninput = () => {
    const customHrefValue = form.customHrefValue.checked;
    const target = form.targetObject.value.trim().split(".")

    form.hrefValue.disabled = !customHrefValue;

    if (target == '')
        form.result.value = '(Results goes here)';
    else
        form.result.innerHTML =
            clobberer(target, customHrefValue && form.hrefValue.value)
                .map(html => `<div class="notification is-link is-light">${escapeHTML(html)}</div>`).join('');
}