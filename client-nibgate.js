import { createOnchainRating, mountRatingUI } from '@nibgate/sdk';

window.nibgateCheckout = async function(resource, options) {
    const btn = document.querySelector(options.unlockButton);
    if (!btn) return;

    let walletAddress = '';
    
    // Check initial state
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }).catch(() => []);
        if (accounts.length > 0) {
            walletAddress = accounts[0];
            btn.textContent = `Pay ${resource.price} USDC`;
        } else {
            btn.textContent = 'Connect Wallet';
        }
    } else {
        btn.textContent = 'No Wallet Detected';
        btn.disabled = true;
    }

    btn.addEventListener('click', async () => {
        if (!window.ethereum) return;
        
        try {
            btn.disabled = true;
            
            // 1. Connect
            if (!walletAddress) {
                btn.textContent = 'Connecting...';
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                walletAddress = accounts[0];
                btn.textContent = `Pay ${resource.price} USDC`;
                btn.disabled = false;
                return; // Stop here, require a second click to pay, matching user request
            }

            // 2. Fetch 402 challenge
            btn.textContent = 'Fetching Payment Details...';
            const res = await fetch(options.accessPath);
            if (res.status === 200) {
                options.onUnlock();
                return;
            }
            
            if (res.status === 402) {
                const challenge = await res.json();
                
                // 3. Sign
                btn.textContent = 'Sign in Wallet...';
                const message = JSON.stringify(challenge);
                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, walletAddress]
                });

                // 4. Verify
                btn.textContent = 'Verifying...';
                const verifyRes = await fetch(options.accessPath, {
                    headers: { 'payment-signature': signature }
                });
                
                if (verifyRes.status === 200) {
                    btn.textContent = 'Unlocked';
                    options.onUnlock();
                } else {
                    const err = await verifyRes.text();
                    throw new Error(err);
                }
            }
        } catch (e) {
            console.error('Payment Error:', e);
            btn.textContent = 'Payment Failed - Try Again';
            btn.disabled = false;
        }
    });
};

window.nibgateRating = createOnchainRating;
window.nibgateMountRatingUI = mountRatingUI;
window.nibgateMountRatingUI = mountRatingUI;
