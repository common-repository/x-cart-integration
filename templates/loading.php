<?php
$wordPressSiteUrl = plugins_url( 'images/ajax-loader.gif', dirname(__FILE__) );
return <<<EOT
<script type="text/template" id="xcart-loading-template">
<jstpl //With addition of classes jstpl>
    <img src="{$wordPressSiteUrl}" />
</script>
EOT;
