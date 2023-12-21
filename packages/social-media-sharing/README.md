# social-media-sharing

Provides a set of functions which open a new tab with social media sharing modal or a proper application window.
Currently provides such functions for VK (VKontakte) and WhatsApp social medias.

<hr />

## shareVk

A simple function that opens a new tab with a VK (VKontakte) social media sharing modal.

### Usage

The function accepts an object with url, title, and image passed as strings.
<br /> 
The url field is the only mandatory field. It safely opens a new tab with a VK sharing modal window when called.

```
import { shareVk } from "@37bytes/social-media-sharing";

shareVk({
    url: "https://example.com",
    title: "Title ",
    image: "https://some-site.com/some-picture.jpg",
  });
```

<hr />

## shareWhatsApp

A simple function that opens a new tab (an application window) with a WhatsApp sharing message.

### Usage

The function accepts an object with url and title passed as strings. 
<br /> 
The url field is the only mandatory field. It safely opens a new tab (an application window) with a WhatsApp sharing message when called.

```
import { shareWhatsApp } from "@37bytes/social-media-sharing";

shareWhatsApp({
    url: "https://example.com",
    title: "Title "
  });
```