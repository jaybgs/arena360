import { createEvmGatewayUnlock, createOnchainRating, mountRatingUI } from '@nibgate/sdk';
import * as circleClientModule from '@circle-fin/x402-batching/client';

window.nibgateCheckout = createEvmGatewayUnlock;
window.circleClientModule = circleClientModule;
window.nibgateRating = createOnchainRating;
window.nibgateMountRatingUI = mountRatingUI;
