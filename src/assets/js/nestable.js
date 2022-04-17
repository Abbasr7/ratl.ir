let getListIds = document.querySelector('#getListIds').value.trim()
let ids = getListIds.split(',')

// output initial serialised data
var updateOutput = function () {
    ids.forEach(id => {
        let output = '#nestable-output-'+id
        $(output).val(JSON.stringify($('#nestable-'+id).nestable('serialize')));
    });
};

// Listen for the event.
document.addEventListener('updateOutput', function (e) {
    updateOutput();
}, false);

$("input[name='navigation_label']").on("change paste keyup", function (e) {
    $(this).closest(".dd-item").data("content", $(this).val());
    $(this).closest(".dd-item").find(".dd3-content span").text($(this).val());
});

$("input[name='navigation_url']").on("change paste keyup", function (e) {
    $(this).closest(".dd-item").data("url", $(this).val());
});

ids.forEach(id => {
    $('#nestable-'+id).nestable({group:id}).on('change', updateOutput);
})
