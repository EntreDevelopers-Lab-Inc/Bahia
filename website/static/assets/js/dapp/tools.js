IPFS_GATEWAY = 'https://gateway.moralisipfs.com/ipfs/'

const delay = ms => new Promise(res => setTimeout(res, ms));

function getIPFSLink(rawLink)
{
    if ('ipfs://' == rawLink.substring(0, 7))
    {
        // use the moralis gateway
        return (IPFS_GATEWAY + rawLink.substring(7));
    }
    else
    {
        // just set the image link as the default
        return rawLink;
    }
}
