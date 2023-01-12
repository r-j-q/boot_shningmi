<?php

namespace GuzzleHttp;

use GuzzleHttp\Handler\CurlHandler;
use GuzzleHttp\Handler\CurlMultiHandler;
use GuzzleHttp\Handler\Proxy;
use GuzzleHttp\Handler\StreamHandler;

/**
 * Expands a URI template
 *
 * @param string $template  URI template
 * @param array  $variables Template variables
 *
 * @return string
 */
function uri_template($template, array $variables)
{
    if (extension_loaded('uri_template')) {
        // @codeCoverageIgnoreStart
        return \uri_template($template, $variables);
        // @codeCoverageIgnoreEnd
    }

    static $uriTemplate;
    if (!$uriTemplate) {
        $uriTemplate = new UriTemplate();
    }

    return $uriTemplate->expand($template, $variables);
}

