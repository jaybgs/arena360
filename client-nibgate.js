import { createEvmGatewayUnlock, createOnchainRating, mountRatingUI } from '@nibgate/sdk';

window.nibgateCheckout = createEvmGatewayUnlock;
window.nibgateRating = createOnchainRating;
window.nibgateMountRatingUI = mountRatingUI;
