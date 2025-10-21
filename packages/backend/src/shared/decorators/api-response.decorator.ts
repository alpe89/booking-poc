import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for response transformation configuration
 */
export const API_RESPONSE_META_KEY = 'api_response_transform';

/**
 * Configuration for how to transform service response into standardized API response
 */
export interface ResponseTransformConfig {
  /**
   * How to extract/transform the response
   * - 'wrap-data': Wrap entire response in { data: response }
   * - 'already-wrapped': Response already has { data, meta?, message? } structure
   * - 'extract-meta': Response has flat structure, extract certain fields into meta
   */
  type: 'wrap-data' | 'already-wrapped' | 'extract-meta';

  /**
   * For 'extract-meta' type: which fields should go into meta
   * All other fields go into data or top-level
   */
  metaFields?: string[];

  /**
   * For 'extract-meta' type: which field contains the main data
   * If not specified, all non-meta fields become data
   */
  dataField?: string;

  /**
   * Optional message field name to extract
   */
  messageField?: string;
}

/**
 * Decorator to configure response transformation for an endpoint
 *
 * @example
 * // Wrap entire response in data field
 * @ApiResponse({ type: 'wrap-data' })
 * async findAll() {
 *   return [{ id: 1 }, { id: 2 }];
 * }
 * // Returns: { data: [{ id: 1 }, { id: 2 }] }
 *
 * @example
 * // Response already has correct structure
 * @ApiResponse({ type: 'already-wrapped' })
 * async findById() {
 *   return { data: { id: 1 }, meta: { someInfo: 'value' } };
 * }
 *
 * @example
 * // Extract specific fields into meta
 * @ApiResponse({
 *   type: 'extract-meta',
 *   dataField: 'data',
 *   metaFields: ['total', 'page', 'limit']
 * })
 * async findAll() {
 *   return { data: [...], total: 100, page: 1, limit: 10 };
 * }
 * // Returns: { data: [...], meta: { total: 100, page: 1, limit: 10 } }
 */
export const ApiResponse = (config: ResponseTransformConfig = { type: 'already-wrapped' }) =>
  SetMetadata(API_RESPONSE_META_KEY, config);
