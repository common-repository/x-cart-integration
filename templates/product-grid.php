<?php
$translate = '__';
$image_box_size = get_option('xcart_image_box_size');

return <<<EOT
<script type="text/template" id="xcart-backward-search-link-template">
    <div class="xcart-back-to-search">
    <a href="#<jstpl= url jstpl>">{$translate('Back to search results', 'xcart-integration')}</a>
    </div>
</script>

<script type="text/template" id="xcart-category-breadcrumbs-template">
    <div id="xcart-breadcrumbs">
    <jstpl _.each(categories, function(category) { jstpl>
        <jstpl if (!category.isLast) { jstpl>
            <a href="#category/<jstpl= category.categoryId jstpl>/page/1/grid/<jstpl= category.gridNumber jstpl>"><jstpl= category.name jstpl></a> >
        <jstpl } else { jstpl>
            <a href="#category/<jstpl= category.categoryId jstpl>/page/1/grid/<jstpl= category.gridNumber jstpl>"><jstpl= category.name jstpl></a>
        <jstpl } jstpl>
    <jstpl }) jstpl>
    </div>
</script>

<script type="text/template" id="xcart-category-grid-template">
<jstpl //With addition of classes jstpl>
    <div class="item-box" do-action="select-category">
        <div class="cat-image-box"><img src='<jstpl= image.url jstpl>' width='<jstpl= image.width jstpl>' height='<jstpl= image.height jstpl>' max-height='{$image_box_size}' max-width='{$image_box_size}' <jstpl if (image.height < {$image_box_size}) {jstpl> style="margin-bottom:<jstpl= ({$image_box_size}-image.height)/2 jstpl>px;margin-top:<jstpl= ({$image_box_size}-image.height)/2 jstpl>px;" <jstpl } jstpl>/></a></div>
        <div class="cat-name-box"><a class="product-name"><jstpl= name jstpl></a></div>
        <div class='clear'></div>
     </div>
</script>

<script type="text/template" id="xcart-product-grid-template">
<jstpl //With addition of classes jstpl>
    <h3><jstpl= name jstpl></h3>
    <div class="tools">
        <div class="xcart-sort-bar">
        {$translate('Sort by', 'xcart-integration')}:
        <a do-action='sort-by-name' href='javascript: void(0);'>{$translate('name', 'xcart-integration')}</a>
        <a do-action='sort-by-price' href='javascript: void(0);'>{$translate('price', 'xcart-integration')}</a>
        <a do-action='sort-by-default' href='javascript: void(0);'>{$translate('recommended', 'xcart-integration')}</a>
        </div>
    </div>
    <div class='products'></div>
    <div class="clear"></div>
</script>

<script type="text/template" id="xcart-pagination-template">
<jstpl //With addition of classes jstpl>
    <div class="xcart-pagination">
    <jstpl counter = gridSize;
       page = 1;
       pageCount = productsCount / gridSize; 
       SPACE = 2; 
       isDotsPrinted = false; 
    jstpl>
    <jstpl if(currentPage != 1) { jstpl>
    <!-- <a do-action="go-to-previous-page">{$translate('Previous', 'xcart-integration')}</a> -->
    <a class="btn-prev" do-action="go-to-previous-page" href='javascript: void(0);'><</a>
    <jstpl } jstpl>
    <jstpl for(var i=1; i<=productsCount; i++) { jstpl>
        <jstpl if(counter == gridSize) {
            counter = 0;
            if(page == currentPage) { jstpl>
            <a class="current" href="javascript: void(0);"><jstpl= page jstpl></a>
            <jstpl } else { 
                isInSpace = page < currentPage && ((page + SPACE) >= currentPage);
                isInSpace = isInSpace || (page > currentPage && (page - SPACE) <= currentPage);
                isLastPages = page > (pageCount - 1);
                if (page < 3 || isLastPages || isInSpace) { jstpl>
                    <a do-action="go-to-page" data-page="<jstpl= pagejstpl>" href='javascript: void(0);'><jstpl= page jstpl></a>
                <jstpl 
                    isDotsPrinted = false;
                    } else { 
                        if (!isDotsPrinted) { jstpl>
                        <a do-action="go-to-page" href='javascript: void(0);'> ... </a>
                        <jstpl 
                        isDotsPrinted = true;
                        } jstpl>
                <jstpl } jstpl>
            <jstpl } jstpl>
        <jstpl 
           page++;
        } jstpl>
        <jstpl counter++;
        jstpl>
    <jstpl } 
       lastPage = page - 1;
    jstpl>
    <jstpl if(currentPage != lastPage) { jstpl>
    <!-- <a do-action="go-to-next-page">{$translate('Next', 'xcart-integration')}</a> -->
    <a class="btn-next" do-action="go-to-next-page" href='javascript: void(0);'>></a>
    <jstpl } jstpl>
    </div>
</script>

<script type="text/template" id="xcart-product-cell-template" class-to-element="xcart-product">
<jstpl //With addition of classes jstpl>
    <div class="item-box">
        <div class="product-name-box"><a class="product-name" do-action="show-product-browser" href='{$options['shopUrl']}?target=product&product_id=<jstpl= productId jstpl>' target='_blank'><jstpl= name jstpl></a></div>
        <div class="product-image-box"><a href='{$options['shopUrl']}?target=product&product_id=<jstpl= productId jstpl>' do-action="show-product-browser"><img src='<jstpl= image[0].url jstpl>' width='<jstpl= image[0].width jstpl>' height='<jstpl= image[0].height jstpl>' max-height='{$image_box_size}' max-width='{$image_box_size}' <jstpl if (image[0].height < {$image_box_size}) {jstpl> style="margin-bottom:<jstpl= ({$image_box_size}-image[0].height)/2 jstpl>px;margin-top:<jstpl= ({$image_box_size}-image[0].height)/2 jstpl>px;" <jstpl } jstpl>/></a></div>
        <div class="product-price-box">{$translate('Price', 'xcart-integration')} <span class="price-value"><jstpl= currencySymbol jstpl><jstpl= price jstpl></span></div>
        <jstpl if ((new Date(releaseDate)) > (new Date)) { jstpl>
            <div class='coming-soon'>{$translate('Coming soon', 'xcart-integration')}</div>
        <jstpl } else { jstpl>
            <button do-action='add-product-to-cart' class="add-product-to-cart">{$translate('Add to cart', 'xcart-integration')}</button>
        <jstpl } jstpl>
        <div class='out-of-stock'>{$translate('out of stock!', 'xcart-integration')}</div>
        <div class='clear'></div>
     </div>
</script>
EOT;
