<?php
$translate = '__';

return <<<EOT
<script type="text/template" id="xcart-mini-cart-template">
<jstpl //With addition of classes jstpl>
    <div class="xcart-minicart-button" do-action="show-cart">
        <div class="minicart-items-number"><jstpl= length jstpl></div>
        <!-- <div class="minicart-items-text">item(s)</div>-->
        <div class="minicart-view-link"><a href="javascript: void(0);">{$translate('View cart', 'xcart-integration')}</a></div>
        <div class="internal-popup items-list empty-cart">
    </div>
</script>

<script type="text/template" id="xcart-cart-template">
<jstpl //With addition of classes jstpl>
    <div class="xcart-popup-wrapper">
        <div class="btn-close-popup"><a href="javascript: void(0);" do-action="hide-cart">&nbsp;</a></div>
        <h3>{$translate('Your cart', 'xcart-integration')}</h3>
        <div class="xcart-cart-product-list-box">
        <table id="xcart-cart-product-list">
        </table>
        </div>
        <a class="btn-update" do-action="update-cart">{$translate('Update cart', 'xcart-integration')}</a>
        <!-- <a class="btn-continue" do-action="hide-cart">{$translate('Continue shopping', 'xcart-integration')}</a> -->
        <a class="btn-clear-cart" do-action='clear-cart'>{$translate('Clear cart', 'xcart-integration')}</a>
        
        <div class='clear'></div>
    </div>
</script>

<script type="text/template" id="xcart-cart-product-template">
<jstpl //With addition of classes jstpl>
        <td class="product-img-column"><img class="product-img" src='<jstpl= image[0].url jstpl>' /></td>
        <td class="product-info-column">
            <div class="product-title"><jstpl= name jstpl></div>
            <div><jstpl= price jstpl> x <input type="text" class="qty-input" value="<jstpl= amount jstpl>" do-action="set-amount"/> = <jstpl= Math.round(price * amount*100)/100 jstpl></div>
            <div class='out-of-stock'>{$translate('out of stock!', 'xcart-integration')}</div>
        </td>
        <td class="product-del-column"><a href="javascript: void(0);" do-action="delete">{$translate('delete', 'xcart-integration')}</a></td>

</script>

<script type="text/template" id="xcart-cart-checkout-form">
<jstpl //With addition of classes jstpl>
        <div class="right-box">
            <input type="hidden" name="target" value="integration_api"/>
            <input type="hidden" name="action" value="add_products_to_cart"/>
            <input type="hidden" name="wp_referer" value="<jstpl= referer jstpl>"/>
            <jstpl _.each(products, function(product) { jstpl>
                <input type="hidden" name="products[]" value="<jstpl= product.get('productId') jstpl>_<jstpl= product.get('amount')jstpl>"/>
            <jstpl }) jstpl>

            <input class="btn-checkout" type="submit" value="{$translate('Checkout', 'xcart-integration')}" />
        </div>
</script>
EOT;
