mongoose = require('mongoose'),
dogecoin = require('node-dogecoin')(),  // you need to install this package

mongoose.connect('mongodb://127.0.0.1:27017/DBNAME');
var Schema = mongoose.Schema;

dogecoin.set({port:12345});
dogecoin.set({passphrasecallback:function () { return "pass";}});
dogecoin.auth('login', 'password');

var paymentsSchema = new Schema( {
    addrHash: String,
    amount: Number
} );

var Payment = mongoose.model( 'Payment', paymentsSchema );

function addToPaymentQueue( pAddr, pValue )
{
    Payment.findOne( { addrHash: pAddr } ).exec( function( err, pAddrRow ) {
        if( !pAddrRow ) {
            payment = new Payment( {
                addrHash: pAddr,
                amount: pValue
            } );
            
            payment.save( function( err ) {
                if( err ) console.log( "Error: can't create payment hz why" );
            } );
        } else {
            pAddrRow.amount += pValue;
            pAddrRow.save( function( err ) {
                if( err ) console.log( "Error: can't create payment hz why" );
            } );
            //console.log( pAddrRow );
        }
    } );
}

function sendManyExec( arr, iAttempt = 0, _callback = null )
{
    console.log( arr );
    dogecoin.exec( 'sendmany', 'account_name', arr, 1, 'just comment', function( error, transaction ) {
        if( error && error.code == -5 && iAttempt < 2 ) {    // if incorrect address i guess
            var invalidAddress = JSON.parse( error.message ).error.message.match( /\w+$/ )[ 0 ];
            //console.log( "\r\n" + invalidAddress );
            delete arr[ invalidAddress ];
            Payment.find( { addrHash: invalidAddress } ).remove().exec();
            iAttempt ++;
            sendManyExec( arr, iAttempt );
        } else if( error ) {
            console.log( error, transaction );
        } else if( !error ) {
            console.log( 'Transaction complete', transaction );
            if( _callback ) {
                console.log( 'Callback complete' );
                _callback();
            }
        }
    } );
}

function intervalFunc() {
    console.log( "\r\n\r\n" );
    Payment.find( {}, function( err, payments ) {
        if( payments.length <= 0 ) {
            console.log( 'Payments list empty' + "\r\n" );
            return false;
        }
        
        var arrayPayments = {};

        payments.forEach(function( curPayment ) {
            arrayPayments[ curPayment.addrHash.toString() ] = ( curPayment.amount.toFixed( 2 ) / 1 ) / 1;
        } );
        
        //console.log( arrayPayments );
        
        sendManyExec( arrayPayments, 0, function() {
            payments.forEach( function( curPayment ) {
                Payment.find( { addrHash: curPayment.addrHash } ).remove().exec();
            } );
        } );
        
        console.log( 'Payments processed' + "\r\n" );
    } );
}


