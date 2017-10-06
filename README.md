# nodejs-sendmany-cryptocoin

dependencies:
```javascript
mongoose, node-dogecoin
```

To add new payment to queue call
```javascript
addToPaymentQueue( 'address_bitcoin', 1.23 );
```

Then add timer
```javascript
setInterval( intervalFunc, 1000 * 60 );
```
