# ShoutCast Web

- Website for shoutcast online radio with history I made when I got bored.
- Wanted to do a PHP for adding articles but lost motivation.
- Uses ShoutCast on port 6262 with streampath "/live" but to overcome ShoutCast not having Access-Control-Allow-Origin, in Apache did this proxy:
```
<VirtualHost *:80>
  ServerName stream
  ProxyPass /currentmetadata http://localhost:6262/currentmetadata
  ProxyPassReverse /currentmetadata http://localhost:6262/currentmetadata
  ProxyPass /played.html http://localhost:6262/played.html
  ProxyPassReverse /played.html http://localhost:6262/played.html
  ProxyPass /live http://localhost:6262/live
  ProxyPassReverse /live http://localhost:6262/live
  ProxyPass /shoutindex.html http://localhost:6262/index.html
  ProxyPassReverse /shoutindex.html http://localhost:6262/index.html
</VirtualHost>
```
- This website is created using Bootstrap, plain CSS, JS, JQuery, Video.js. Then Apache or nginx for hosting the site and proxing the ShoutCast or IceCast (would need a rewrite of fetch functions).
- The website nicely scales to all devices, if I don't count the history table. That would need a redo.
- For some more info visit the text file named "pinned.txt" in the articles folder.
- Also this website will play the stream when switching to another pages because it's loaded with JS and back/forwards buttons work too with it :)
- I allow people to use parts of my code, also this entire site with changes to my artwork.
- Screenshots: [Imgur](https://imgur.com/a/VrV9AFj)

