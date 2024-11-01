<?php
$translate = '__';

return <<<EOT
<script type="text/template" id="xcart-search-widget-template">
<jstpl //With addition of classes jstpl>
    <input type="text" do-action="search" placeholder="{$translate('Search items...', 'xcart-integration')}" />
    <button type="button" do-action="search-by-button" class="xcart-searchwidget-button">{$translate('To search', 'xcart-integration')}</button>
</script>
EOT;

?>
