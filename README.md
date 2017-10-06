# nodejs-sendmany-cryptocoin

dependencies:
mongoose, node-dogecoin

To add new payment to queue call
addToPaymentQueue( 'address_bitcoin', 1.23 );

Then add timer
setInterval( intervalFunc, 1000 * 60 );
