function VerticalCenter(item)
{
    var searchBlockHeight = item.height();
    var searchBlockMarginTop = Math.floor(($(window).height() - searchBlockHeight) / 2);
    if (searchBlockMarginTop > 0)
        item.css("margin-top", searchBlockMarginTop);
}
