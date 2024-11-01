<?php
$translate = '__';
$image_box_size = get_option('xcart_image_box_size');

return <<<EOT
<script type="text/template" id="xcart-product-template" class-to-element="xcart-product-browser">
<jstpl //With addition of classes jstpl>
    <h2 class="xcart-product-title"><a href='{$options['shopUrl']}?target=product&product_id=<jstpl= productId jstpl>' target='_blank'><jstpl= name jstpl></a></h2>
    <div class="backward_link_placeholder"></div>
    <div class="breadcrumbs_placeholder"></div>
    <div class="forward_backward">
    <a do-action='move-backward' class="prev-product">{$translate('previuos product', 'xcart-integration')}</a> | <a do-action='move-forward'  class="next-product">{$translate('next product', 'xcart-integration')}</a>
    </div>
        
        <div class="xcart-product-box">
            
            <div class="xcart-product-image">
                <img class='xcart_product_image' src='<jstpl= image[0].url jstpl>' width='<jstpl= image[0].width jstpl>' height='<jstpl= image[0].height jstpl>' max-height='{$image_box_size}' max-width='{$image_box_size}' />
            </div>
            
            <div class="xcart-product-details">
                
                <div class="prorerty-line">
                    <span class='property-name'>{$translate('SKU', 'xcart-integration')}</span>
                    <span class='property-value'><jstpl= sku jstpl></span>
                </div>
                
                <div class='prorerty-line price-line'>
                    <span class='property-name'>{$translate('Price', 'xcart-integration')}</span>
                    <span class='property-value price-value'><jstpl= currencySymbol jstpl><jstpl= price jstpl></span>
                </div>

                <div class='out-of-stock'>{$translate('out of stock!', 'xcart-integration')}</div>

                <jstpl if ((new Date(releaseDate)) > (new Date)) { jstpl>
                <div class='coming-soon'>{$translate('Coming soon', 'xcart-integration')}</div>
                <jstpl } else { jstpl>
                <div class='buynow-block'>
                 <button do-action='add-product-to-cart'>{$translate('Add to cart', 'xcart-integration')}</button>
                </div>
                <jstpl } jstpl>


            </div>

        </div>
        

        <div class="xcart-product-description"><jstpl= translations['en']['description'] jstpl></div>
        <div class='clear'></div>
</script>
EOT;
