/*
	Generates an offline FIO transaction that can be submitted to a FIO API node.
		
	This should be run AFTER the network variables are updated (via the command: 'node network.js')

	Instructions:
	1) Change the baseUrl variable, to the correct URL.

	2) run the file
	This file is run via command line:
	i.e.
		> node index.js

	RESULTS:
	* localSignedTransactions.txt has the local signed transactions packaged as a curl command 

	Author: Shawn Arney
*/

const properties = require('./properties.js');
const FIOJS = require('@fioprotocol/fiojs');
const TextEncoding = require('text-encoding');
const fs = require("fs");
const fetch = require('node-fetch');


const baseUrl = properties.server + '/v1/chain/';
const privateKey = properties.privateKey;
const publicKey = properties.publicKey;
const account = properties.account;
const maxFee = properties.maxFee;

const action = properties.action;

// trnsfiopubky 
const transferAmount = properties.transferAmount;
const payeePubKey = properties.payeePubKey;

// voteproducer 
const voterFioAddress = properties.voterFioAddress;
const producerList = properties.producerList;




// files
const networkFile = 'network.json';
const signedTransactionFileName = 'localSignedTransactions.txt'

// these variables are populated by running 'node network.js' - from a networked computer
head_block_time = ''
chain_id = ''
ref_block_num = ''
ref_block_prefix = ''

function getAbiMap () {

	abiMap = new Map()

	//tokenRawAbi = await fetch(baseUrl + 'get_raw_abi', { body: `{"account_name": "fio.token"}`, method: 'POST' });
	//console.log('tokenRawAbi: ', tokenRawAbi)
	//abiMap.set('fio.token', tokenRawAbi);

	//tokenRawAbi = await(await fetch(baseUrl + 'get_raw_abi', { body: `{"account_name": "eosio"}`, method: 'POST' })).json();
	//abiMap.set('eosio', tokenRawAbi);

	//tokenRawAbi = await(await fetch(baseUrl + 'get_raw_abi', { body: `{"account_name": "fio.address"}`, method: 'POST' })).json();
	//abiMap.set('fio.address', tokenRawAbi);

	//tokenRawAbi = await(await fetch(baseUrl + 'get_raw_abi', { body: `{"account_name": "fio.reqobt"}`, method: 'POST' })).json();
	//abiMap.set('fio.reqobt', tokenRawAbi);

	abiMap.set('fio.token', {
		account_name: 'fio.token',
		abi: 'DmVvc2lvOjphYmkvMS4xAAgHYWNjb3VudAABB2JhbGFuY2UFYXNzZXQGY3JlYXRlAAEObWF4aW11bV9zdXBwbHkFYXNzZXQOY3VycmVuY3lfc3RhdHMAAwZzdXBwbHkFYXNzZXQKbWF4X3N1cHBseQVhc3NldAZpc3N1ZXIEbmFtZQVpc3N1ZQADAnRvBG5hbWUIcXVhbnRpdHkFYXNzZXQEbWVtbwZzdHJpbmcHbWludGZpbwACAnRvBG5hbWUGYW1vdW50BnVpbnQ2NAZyZXRpcmUAAghxdWFudGl0eQVhc3NldARtZW1vBnN0cmluZwh0cmFuc2ZlcgAEBGZyb20EbmFtZQJ0bwRuYW1lCHF1YW50aXR5BWFzc2V0BG1lbW8Gc3RyaW5nDHRybnNmaW9wdWJreQAFEHBheWVlX3B1YmxpY19rZXkGc3RyaW5nBmFtb3VudAVpbnQ2NAdtYXhfZmVlBWludDY0BWFjdG9yBG5hbWUEdHBpZAZzdHJpbmcGAAAAAKhs1EUGY3JlYXRlAAAAAAAApTF2BWlzc3VlAAAAAIC6laeTB21pbnRmaW8AAAAAAKjrsroGcmV0aXJlAAAAAFctPM3NCHRyYW5zZmVyAODh0ZW6hefNDHRybnNmaW9wdWJreQACAAAAOE9NETIDaTY0AAAHYWNjb3VudAAAAAAAkE3GA2k2NAAADmN1cnJlbmN5X3N0YXRzAAAAAA==='
	})

	abiMap.set('eosio', {
		account_name: 'eosio',
		abi: 'DmVvc2lvOjphYmkvMS4xADIIYWJpX2hhc2gAAgVvd25lcgRuYW1lBGhhc2gLY2hlY2tzdW0yNTYJYWRkbG9ja2VkAAMFb3duZXIEbmFtZQZhbW91bnQFaW50NjQIbG9ja3R5cGUFaW50MTYJYXV0aG9yaXR5AAQJdGhyZXNob2xkBnVpbnQzMgRrZXlzDGtleV93ZWlnaHRbXQhhY2NvdW50cxlwZXJtaXNzaW9uX2xldmVsX3dlaWdodFtdBXdhaXRzDXdhaXRfd2VpZ2h0W10MYmxvY2tfaGVhZGVyAAgJdGltZXN0YW1wBnVpbnQzMghwcm9kdWNlcgRuYW1lCWNvbmZpcm1lZAZ1aW50MTYIcHJldmlvdXMLY2hlY2tzdW0yNTYRdHJhbnNhY3Rpb25fbXJvb3QLY2hlY2tzdW0yNTYMYWN0aW9uX21yb290C2NoZWNrc3VtMjU2EHNjaGVkdWxlX3ZlcnNpb24GdWludDMyDW5ld19wcm9kdWNlcnMScHJvZHVjZXJfc2NoZWR1bGU/FWJsb2NrY2hhaW5fcGFyYW1ldGVycwARE21heF9ibG9ja19uZXRfdXNhZ2UGdWludDY0GnRhcmdldF9ibG9ja19uZXRfdXNhZ2VfcGN0BnVpbnQzMhltYXhfdHJhbnNhY3Rpb25fbmV0X3VzYWdlBnVpbnQzMh5iYXNlX3Blcl90cmFuc2FjdGlvbl9uZXRfdXNhZ2UGdWludDMyEG5ldF91c2FnZV9sZWV3YXkGdWludDMyI2NvbnRleHRfZnJlZV9kaXNjb3VudF9uZXRfdXNhZ2VfbnVtBnVpbnQzMiNjb250ZXh0X2ZyZWVfZGlzY291bnRfbmV0X3VzYWdlX2RlbgZ1aW50MzITbWF4X2Jsb2NrX2NwdV91c2FnZQZ1aW50MzIadGFyZ2V0X2Jsb2NrX2NwdV91c2FnZV9wY3QGdWludDMyGW1heF90cmFuc2FjdGlvbl9jcHVfdXNhZ2UGdWludDMyGW1pbl90cmFuc2FjdGlvbl9jcHVfdXNhZ2UGdWludDMyGG1heF90cmFuc2FjdGlvbl9saWZldGltZQZ1aW50MzIeZGVmZXJyZWRfdHJ4X2V4cGlyYXRpb25fd2luZG93BnVpbnQzMhVtYXhfdHJhbnNhY3Rpb25fZGVsYXkGdWludDMyFm1heF9pbmxpbmVfYWN0aW9uX3NpemUGdWludDMyF21heF9pbmxpbmVfYWN0aW9uX2RlcHRoBnVpbnQxNhNtYXhfYXV0aG9yaXR5X2RlcHRoBnVpbnQxNgpidXJuYWN0aW9uAAELZmlvYWRkcmhhc2gHdWludDEyOAtjYW5jZWxkZWxheQACDmNhbmNlbGluZ19hdXRoEHBlcm1pc3Npb25fbGV2ZWwGdHJ4X2lkC2NoZWNrc3VtMjU2C2NyYXV0b3Byb3h5AAIFcHJveHkEbmFtZQVvd25lcgRuYW1lCmRlbGV0ZWF1dGgAAwdhY2NvdW50BG5hbWUKcGVybWlzc2lvbgRuYW1lB21heF9mZWUGdWludDY0EmVvc2lvX2dsb2JhbF9zdGF0ZRVibG9ja2NoYWluX3BhcmFtZXRlcnMLHWxhc3RfcHJvZHVjZXJfc2NoZWR1bGVfdXBkYXRlFGJsb2NrX3RpbWVzdGFtcF90eXBlGGxhc3RfcGVydm90ZV9idWNrZXRfZmlsbAp0aW1lX3BvaW50DnBlcnZvdGVfYnVja2V0BWludDY0D3BlcmJsb2NrX2J1Y2tldAVpbnQ2NBN0b3RhbF91bnBhaWRfYmxvY2tzBnVpbnQzMg90b3RhbF92b3RlZF9maW8FaW50NjQVdGhyZXNoX3ZvdGVkX2Zpb190aW1lCnRpbWVfcG9pbnQbbGFzdF9wcm9kdWNlcl9zY2hlZHVsZV9zaXplBnVpbnQxNhp0b3RhbF9wcm9kdWNlcl92b3RlX3dlaWdodAdmbG9hdDY0D2xhc3RfbmFtZV9jbG9zZRRibG9ja190aW1lc3RhbXBfdHlwZQ9sYXN0X2ZlZV91cGRhdGUUYmxvY2tfdGltZXN0YW1wX3R5cGUTZW9zaW9fZ2xvYmFsX3N0YXRlMgADDmxhc3RfYmxvY2tfbnVtFGJsb2NrX3RpbWVzdGFtcF90eXBlHHRvdGFsX3Byb2R1Y2VyX3ZvdGVwYXlfc2hhcmUHZmxvYXQ2NAhyZXZpc2lvbgV1aW50OBNlb3Npb19nbG9iYWxfc3RhdGUzAAIWbGFzdF92cGF5X3N0YXRlX3VwZGF0ZQp0aW1lX3BvaW50HHRvdGFsX3ZwYXlfc2hhcmVfY2hhbmdlX3JhdGUHZmxvYXQ2NAZpbmNyYW0AAglhY2NvdW50bW4EbmFtZQZhbW91bnQFaW50NjQMaW5oaWJpdHVubGNrAAIFb3duZXIEbmFtZQV2YWx1ZQZ1aW50MzIEaW5pdAACB3ZlcnNpb24JdmFydWludDMyBGNvcmUGc3ltYm9sCmtleV93ZWlnaHQAAgNrZXkKcHVibGljX2tleQZ3ZWlnaHQGdWludDE2CGxpbmthdXRoAAUHYWNjb3VudARuYW1lBGNvZGUEbmFtZQR0eXBlBG5hbWULcmVxdWlyZW1lbnQEbmFtZQdtYXhfZmVlBnVpbnQ2NBhsb2NrZWRfdG9rZW5faG9sZGVyX2luZm8ABwVvd25lcgRuYW1lEnRvdGFsX2dyYW50X2Ftb3VudAZ1aW50NjQVdW5sb2NrZWRfcGVyaW9kX2NvdW50BnVpbnQzMgpncmFudF90eXBlBnVpbnQzMhFpbmhpYml0X3VubG9ja2luZwZ1aW50MzIXcmVtYWluaW5nX2xvY2tlZF9hbW91bnQGdWludDY0CXRpbWVzdGFtcAZ1aW50MzIKbmV3YWNjb3VudAAEB2NyZWF0b3IEbmFtZQRuYW1lBG5hbWUFb3duZXIJYXV0aG9yaXR5BmFjdGl2ZQlhdXRob3JpdHkHb25ibG9jawABBmhlYWRlcgxibG9ja19oZWFkZXIHb25lcnJvcgACCXNlbmRlcl9pZAd1aW50MTI4CHNlbnRfdHJ4BWJ5dGVzEHBlcm1pc3Npb25fbGV2ZWwAAgVhY3RvcgRuYW1lCnBlcm1pc3Npb24EbmFtZRdwZXJtaXNzaW9uX2xldmVsX3dlaWdodAACCnBlcm1pc3Npb24QcGVybWlzc2lvbl9sZXZlbAZ3ZWlnaHQGdWludDE2DXByb2R1Y2VyX2luZm8ADAJpZAZ1aW50NjQFb3duZXIEbmFtZQtmaW9fYWRkcmVzcwZzdHJpbmcLYWRkcmVzc2hhc2gHdWludDEyOAt0b3RhbF92b3RlcwdmbG9hdDY0E3Byb2R1Y2VyX3B1YmxpY19rZXkKcHVibGljX2tleQlpc19hY3RpdmUEYm9vbAN1cmwGc3RyaW5nDXVucGFpZF9ibG9ja3MGdWludDMyD2xhc3RfY2xhaW1fdGltZQp0aW1lX3BvaW50DGxhc3RfYnBjbGFpbQZ1aW50MzIIbG9jYXRpb24GdWludDE2DHByb2R1Y2VyX2tleQACDXByb2R1Y2VyX25hbWUEbmFtZRFibG9ja19zaWduaW5nX2tleQpwdWJsaWNfa2V5EXByb2R1Y2VyX3NjaGVkdWxlAAIHdmVyc2lvbgZ1aW50MzIJcHJvZHVjZXJzDnByb2R1Y2VyX2tleVtdC3JlZ3Byb2R1Y2VyAAYLZmlvX2FkZHJlc3MGc3RyaW5nC2Zpb19wdWJfa2V5BnN0cmluZwN1cmwGc3RyaW5nCGxvY2F0aW9uBnVpbnQxNgVhY3RvcgRuYW1lB21heF9mZWUFaW50NjQIcmVncHJveHkAAwtmaW9fYWRkcmVzcwZzdHJpbmcFYWN0b3IEbmFtZQdtYXhfZmVlBWludDY0CnJlc2V0Y2xhaW0AAQhwcm9kdWNlcgRuYW1lC3JtdnByb2R1Y2VyAAEIcHJvZHVjZXIEbmFtZQZzZXRhYmkAAgdhY2NvdW50BG5hbWUDYWJpBWJ5dGVzDHNldGF1dG9wcm94eQACBXByb3h5BG5hbWUFb3duZXIEbmFtZQdzZXRjb2RlAAQHYWNjb3VudARuYW1lBnZtdHlwZQV1aW50OAl2bXZlcnNpb24FdWludDgEY29kZQVieXRlcwlzZXRwYXJhbXMAAQZwYXJhbXMVYmxvY2tjaGFpbl9wYXJhbWV0ZXJzB3NldHByaXYAAgdhY2NvdW50BG5hbWUHaXNfcHJpdgV1aW50OA10b3BfcHJvZF9pbmZvAAEIcHJvZHVjZXIEbmFtZQp1bmxpbmthdXRoAAMHYWNjb3VudARuYW1lBGNvZGUEbmFtZQR0eXBlBG5hbWUMdW5sb2NrdG9rZW5zAAEFYWN0b3IEbmFtZQl1bnJlZ3Byb2QAAwtmaW9fYWRkcmVzcwZzdHJpbmcFYWN0b3IEbmFtZQdtYXhfZmVlBWludDY0CnVucmVncHJveHkAAwtmaW9fYWRkcmVzcwZzdHJpbmcFYWN0b3IEbmFtZQdtYXhfZmVlBWludDY0CnVwZGF0ZWF1dGgABQdhY2NvdW50BG5hbWUKcGVybWlzc2lvbgRuYW1lBnBhcmVudARuYW1lBGF1dGgJYXV0aG9yaXR5B21heF9mZWUGdWludDY0C3VwZGF0ZXBvd2VyAAIFdm90ZXIEbmFtZQp1cGRhdGVvbmx5BGJvb2wLdXBkbGJwY2xhaW0AAQhwcm9kdWNlcgRuYW1lCXVwZGxvY2tlZAACBW93bmVyBG5hbWUPYW1vdW50cmVtYWluaW5nBnVpbnQ2NAx1cGR0cmV2aXNpb24AAQhyZXZpc2lvbgV1aW50OA51c2VyX3Jlc291cmNlcwAEBW93bmVyBG5hbWUKbmV0X3dlaWdodAVhc3NldApjcHVfd2VpZ2h0BWFzc2V0CXJhbV9ieXRlcwVpbnQ2NAx2b3RlcHJvZHVjZXIABAlwcm9kdWNlcnMIc3RyaW5nW10LZmlvX2FkZHJlc3MGc3RyaW5nBWFjdG9yBG5hbWUHbWF4X2ZlZQVpbnQ2NAl2b3RlcHJveHkABAVwcm94eQZzdHJpbmcLZmlvX2FkZHJlc3MGc3RyaW5nBWFjdG9yBG5hbWUHbWF4X2ZlZQVpbnQ2NAp2b3Rlcl9pbmZvAAwCaWQGdWludDY0CmZpb2FkZHJlc3MGc3RyaW5nC2FkZHJlc3NoYXNoB3VpbnQxMjgFb3duZXIEbmFtZQVwcm94eQRuYW1lCXByb2R1Y2VycwZuYW1lW10QbGFzdF92b3RlX3dlaWdodAdmbG9hdDY0E3Byb3hpZWRfdm90ZV93ZWlnaHQHZmxvYXQ2NAhpc19wcm94eQRib29sDWlzX2F1dG9fcHJveHkEYm9vbAlyZXNlcnZlZDIGdWludDMyCXJlc2VydmVkMwVhc3NldAt3YWl0X3dlaWdodAACCHdhaXRfc2VjBnVpbnQzMgZ3ZWlnaHQGdWludDE2IAAASAoiGlMyCWFkZGxvY2tlZAAAwKQuIzOvPgpidXJuYWN0aW9uAAC8iSpFhaZBC2NhbmNlbGRlbGF5AAB8p7fSrM1FC2NyYXV0b3Byb3h5AABAy9qorKJKCmRlbGV0ZWF1dGgAAAAAAEhz0XQGaW5jcmFtAABRnDq749p0DGluaGliaXR1bmxjawAAAAAAAJDddARpbml0AAAAAC1rA6eLCGxpbmthdXRoAABAnpoiZLiaCm5ld2FjY291bnQAAAAAACIaz6QHb25ibG9jawAAAADg0nvVpAdvbmVycm9yAACuQjrRW5m6C3JlZ3Byb2R1Y2VyAAAAAL7TW5m6CHJlZ3Byb3h5AACAdCairLC6CnJlc2V0Y2xhaW0AAK5COtFbt7wLcm12cHJvZHVjZXIAAAAAALhjssIGc2V0YWJpAOA7vZVmbbLCDHNldGF1dG9wcm94eQAAAABAJYqywgdzZXRjb2RlAAAAwNJcU7PCCXNldHBhcmFtcwAAAABgu1uzwgdzZXRwcml2AABAy9rA6eLUCnVubGlua2F1dGgAgKeCNENE49QMdW5sb2NrdG9rZW5zAAAASPRWpu7UCXVucmVncHJvZAAAgO/0Vqbu1Ap1bnJlZ3Byb3h5AABAy9qobFLVCnVwZGF0ZWF1dGgAAK7itKpsUtULdXBkYXRlcG93ZXIAAKQzEdUTU9ULdXBkbGJwY2xhaW0AAABICiIaU9UJdXBkbG9ja2VkADCpw26rm1PVDHVwZHRyZXZpc2lvbgBwFdKJ3qoy3Qx2b3RlcHJvZHVjZXIAAADwnd6qMt0Jdm90ZXByb3h5AAkAAACgYdPcMQNpNjQAAAhhYmlfaGFzaAAAAABEc2hkA2k2NAAAEmVvc2lvX2dsb2JhbF9zdGF0ZQAAAEBEc2hkA2k2NAAAE2Vvc2lvX2dsb2JhbF9zdGF0ZTIAAABgRHNoZANpNjQAABNlb3Npb19nbG9iYWxfc3RhdGUzgKeCNCcFEY0DaTY0AAAYbG9ja2VkX3Rva2VuX2hvbGRlcl9pbmZvAADAVyGd6K0DaTY0AAANcHJvZHVjZXJfaW5mbwAAADjRWyvNA2k2NAAADXRvcF9wcm9kX2luZm8AAAAAq3sV1gNpNjQAAA51c2VyX3Jlc291cmNlcwAAAADgqzLdA2k2NAAACnZvdGVyX2luZm8AAAAA='
	})

	abiMap.set('fio.address', {
		account_name: 'fio.address',
		abi: 'DmVvc2lvOjphYmkvMS4wAA0HZmlvbmFtZQAJAmlkBnVpbnQ2NARuYW1lBnN0cmluZwhuYW1laGFzaAd1aW50MTI4BmRvbWFpbgZzdHJpbmcKZG9tYWluaGFzaAd1aW50MTI4CmV4cGlyYXRpb24GdWludDY0DW93bmVyX2FjY291bnQEbmFtZQlhZGRyZXNzZXMOdG9rZW5wdWJhZGRyW10XYnVuZGxlZWxpZ2libGVjb3VudGRvd24GdWludDY0BmRvbWFpbgAGAmlkBnVpbnQ2NARuYW1lBnN0cmluZwpkb21haW5oYXNoB3VpbnQxMjgHYWNjb3VudARuYW1lCWlzX3B1YmxpYwV1aW50OApleHBpcmF0aW9uBnVpbnQzMgplb3Npb19uYW1lAAMHYWNjb3VudARuYW1lCWNsaWVudGtleQZzdHJpbmcHa2V5aGFzaAd1aW50MTI4CnJlZ2FkZHJlc3MABQtmaW9fYWRkcmVzcwZzdHJpbmcUb3duZXJfZmlvX3B1YmxpY19rZXkGc3RyaW5nB21heF9mZWUFaW50NjQFYWN0b3IEbmFtZQR0cGlkBnN0cmluZwx0b2tlbnB1YmFkZHIAAwp0b2tlbl9jb2RlBnN0cmluZwpjaGFpbl9jb2RlBnN0cmluZw5wdWJsaWNfYWRkcmVzcwZzdHJpbmcKYWRkYWRkcmVzcwAFC2Zpb19hZGRyZXNzBnN0cmluZxBwdWJsaWNfYWRkcmVzc2VzDnRva2VucHViYWRkcltdB21heF9mZWUFaW50NjQFYWN0b3IEbmFtZQR0cGlkBnN0cmluZwlyZWdkb21haW4ABQpmaW9fZG9tYWluBnN0cmluZxRvd25lcl9maW9fcHVibGljX2tleQZzdHJpbmcHbWF4X2ZlZQVpbnQ2NAVhY3RvcgRuYW1lBHRwaWQGc3RyaW5nC3JlbmV3ZG9tYWluAAQKZmlvX2RvbWFpbgZzdHJpbmcHbWF4X2ZlZQVpbnQ2NAR0cGlkBnN0cmluZwVhY3RvcgRuYW1lDHJlbmV3YWRkcmVzcwAEC2Zpb19hZGRyZXNzBnN0cmluZwdtYXhfZmVlBWludDY0BHRwaWQGc3RyaW5nBWFjdG9yBG5hbWUMc2V0ZG9tYWlucHViAAUKZmlvX2RvbWFpbgZzdHJpbmcJaXNfcHVibGljBGludDgHbWF4X2ZlZQVpbnQ2NAVhY3RvcgRuYW1lBHRwaWQGc3RyaW5nC2J1cm5leHBpcmVkAAALZGVjcmNvdW50ZXIAAgtmaW9fYWRkcmVzcwZzdHJpbmcEc3RlcAVpbnQzMgpiaW5kMmVvc2lvAAMHYWNjb3VudARuYW1lCmNsaWVudF9rZXkGc3RyaW5nCGV4aXN0aW5nBGJvb2wIAADG6qZkmLoKcmVnYWRkcmVzcwAAAMbqpmRSMgphZGRhZGRyZXNzAAAAmM5Impi6CXJlZ2RvbWFpbgAApjOSJq6mugtyZW5ld2RvbWFpbgCAsbopGa6mugxyZW5ld2FkZHJlc3MAAJK6rnY1rz4LYnVybmV4cGlyZWQAcHSdzkiassIMc2V0ZG9tYWlucHViAAAAdZgqkaY7CmJpbmQyZW9zaW8AAwAAAFhJM6lbA2k2NAECaWQBBnN0cmluZwdmaW9uYW1lAAAAAE9nJE0DaTY0AQJpZAEGc3RyaW5nBmRvbWFpbgBANTJPTREyA2k2NAEHYWNjb3VudAEGdWludDY0CmVvc2lvX25hbWUAAAAA='
	})

	abiMap.set('fio.reqobt', {
		account_name: 'fio.reqobt',
		abi: 'DmVvc2lvOjphYmkvMS4wAAYKZmlvcmVxY3R4dAANDmZpb19yZXF1ZXN0X2lkBnVpbnQ2NBFwYXllcl9maW9fYWRkcmVzcwd1aW50MTI4EXBheWVlX2Zpb19hZGRyZXNzB3VpbnQxMjgZcGF5ZXJfZmlvX2FkZHJlc3NfaGV4X3N0cgZzdHJpbmcZcGF5ZWVfZmlvX2FkZHJlc3NfaGV4X3N0cgZzdHJpbmcbcGF5ZXJfZmlvX2FkZHJlc3Nfd2l0aF90aW1lB3VpbnQxMjgbcGF5ZWVfZmlvX2FkZHJlc3Nfd2l0aF90aW1lB3VpbnQxMjgHY29udGVudAZzdHJpbmcKdGltZV9zdGFtcAZ1aW50NjQOcGF5ZXJfZmlvX2FkZHIGc3RyaW5nDnBheWVlX2Zpb19hZGRyBnN0cmluZwlwYXllcl9rZXkGc3RyaW5nCXBheWVlX2tleQZzdHJpbmcOcmVjb3Jkb2J0X2luZm8ADQJpZAZ1aW50NjQRcGF5ZXJfZmlvX2FkZHJlc3MHdWludDEyOBFwYXllZV9maW9fYWRkcmVzcwd1aW50MTI4GXBheWVyX2Zpb19hZGRyZXNzX2hleF9zdHIGc3RyaW5nGXBheWVlX2Zpb19hZGRyZXNzX2hleF9zdHIGc3RyaW5nG3BheWVyX2Zpb19hZGRyZXNzX3dpdGhfdGltZQd1aW50MTI4G3BheWVlX2Zpb19hZGRyZXNzX3dpdGhfdGltZQd1aW50MTI4B2NvbnRlbnQGc3RyaW5nCnRpbWVfc3RhbXAGdWludDY0DnBheWVyX2Zpb19hZGRyBnN0cmluZw5wYXllZV9maW9fYWRkcgZzdHJpbmcJcGF5ZXJfa2V5BnN0cmluZwlwYXllZV9rZXkGc3RyaW5nCWZpb3JlcXN0cwAFAmlkBnVpbnQ2NA5maW9fcmVxdWVzdF9pZAZ1aW50NjQGc3RhdHVzBnVpbnQ2NAhtZXRhZGF0YQZzdHJpbmcKdGltZV9zdGFtcAZ1aW50NjQJcmVjb3Jkb2J0AAcOZmlvX3JlcXVlc3RfaWQGc3RyaW5nEXBheWVyX2Zpb19hZGRyZXNzBnN0cmluZxFwYXllZV9maW9fYWRkcmVzcwZzdHJpbmcHY29udGVudAZzdHJpbmcHbWF4X2ZlZQVpbnQ2NAVhY3RvcgZzdHJpbmcEdHBpZAZzdHJpbmcLbmV3ZnVuZHNyZXEABhFwYXllcl9maW9fYWRkcmVzcwZzdHJpbmcRcGF5ZWVfZmlvX2FkZHJlc3MGc3RyaW5nB2NvbnRlbnQGc3RyaW5nB21heF9mZWUFaW50NjQFYWN0b3IGc3RyaW5nBHRwaWQGc3RyaW5nDHJlamVjdGZuZHJlcQAEDmZpb19yZXF1ZXN0X2lkBnN0cmluZwdtYXhfZmVlBWludDY0BWFjdG9yBnN0cmluZwR0cGlkBnN0cmluZwMAAMiHpkuRuglyZWNvcmRvYnQAAKy6OE29uJoLbmV3ZnVuZHNyZXEAYNVNc2WknroMcmVqZWN0Zm5kcmVxAAMAcO4ZWXWpWwNpNjQBDmZpb19yZXF1ZXN0X2lkAQZ1aW50NjQKZmlvcmVxY3R4dAAAzoemS5G6A2k2NAECaWQBBnVpbnQ2NA5yZWNvcmRvYnRfaW5mbwAAxhlbdalbA2k2NAECaWQBBnVpbnQ2NAlmaW9yZXFzdHMAAAAA='
	})

	return abiMap;
}

async function generatePushTransaction (actionName, transaction) {

	fs.appendFileSync(signedTransactionFileName, "action: " + actionName + "\r\n" + "\r\n");

	const pushTransaction = "curl " + baseUrl  + "push_transaction -X POST -d '" + JSON.stringify(transaction) + "'"
	console.log(pushTransaction)
	fs.appendFileSync(signedTransactionFileName, pushTransaction + "\r\n" + "\r\n");
}

async function generateSignedTransaction (accountName, actionName, data){

	transaction = {
		expiration: getExpirationDate(),
		ref_block_num: ref_block_num & 0xffff,
		ref_block_prefix: ref_block_prefix,
		actions: [{
				account: accountName,
				name: actionName,
				authorization: [{
					actor: account,
						permission: 'active',
				}],
				data: data,
		}]
	};

	const signedTransaction = await FIOJS.Fio.prepareTransaction({
        transaction, chainId: chain_id, privateKeys: [privateKey], abiMap: getAbiMap(),
        textDecoder: new TextEncoding.TextDecoder(), textEncoder: new TextEncoding.TextEncoder(),
      })

	generatePushTransaction(actionName, signedTransaction); // write to file

	return signedTransaction;
}

function getExpirationDate () {
	const expiration = new Date(head_block_time)
    expiration.setSeconds(expiration.getSeconds() + 1200)
    const expirationStr = expiration.toISOString()
    return expirationStr.substr(0, expirationStr.length - 1)
} 

// this is an example of how to transfer funds
async function generateTransferFunds () {
	const data = {
		payee_public_key: payeePubKey,
		amount: transferAmount,
		max_fee: maxFee,
		actor: account,
    tpid: ''
    }

	const transaction = await generateSignedTransaction ('fio.token', 'trnsfiopubky' , data)
}

async function generateVoteProducerTransaction () {
	const data = {
		"producers": producerList,
    "fio_address": voterFioAddress,
		max_fee: maxFee,
		actor: account,
    }

	const transaction = await generateSignedTransaction ('eosio', 'voteproducer' , data)
}

// put all the calls you wish to generate... here
function generatePushTransactions () {
	date = new Date().toISOString()
	
	fs.appendFileSync(signedTransactionFileName, date + "\r\n" + "\r\n");

	if (action == 'voteproducer') {
		generateVoteProducerTransaction();
	} else if (action == 'trnsfiopubky') {
		generateTransferFunds();
	}
}

// start of script
function main () {
	fs.readFile(networkFile, function(err, data) { 
	      
	    // Check for errors 
	    if (err) throw err; 
	   
	    // Converting to JSON 
	    const networkVariables = JSON.parse(data); 

	    // network.json variables (as created from 'node network.js' call)
		head_block_time = networkVariables.head_block_time
		chain_id = networkVariables.chain_id
		ref_block_num = networkVariables.ref_block_num
		ref_block_prefix = networkVariables.ref_block_prefix

	    // create the push transactions
	    generatePushTransactions() 
	}); 
}

main();