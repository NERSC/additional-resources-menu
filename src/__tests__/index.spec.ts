import {
  filterValidLinks,
  isMixedContent,
  newHelpResourceWidget,
  PLUGIN_ID,
  OPEN_COMMAND,
  CSS_CLASS
} from '../index';

describe('additional-resources-menu', () => {
  describe('Constants', () => {
    it('should have correct plugin ID and command names', () => {
      expect(PLUGIN_ID).toBe('additional-resources-menu:plugin');
      expect(OPEN_COMMAND).toBe('additional-resources-menu:open');
      expect(CSS_CLASS).toBe('jp-additional-resources-menu');
    });
  });

  describe('filterValidLinks', () => {
    it('should return empty array for non-array inputs', () => {
      expect(filterValidLinks(null as any)).toEqual([]);
      expect(filterValidLinks(undefined as any)).toEqual([]);
      expect(filterValidLinks('invalid' as any)).toEqual([]);
      expect(filterValidLinks({} as any)).toEqual([]);
    });

    it('should filter out invalid objects or objects without name or url', () => {
      const input = [
        null,
        123,
        { name: 'Missing URL' },
        { url: 'https://example.com' },
        { name: 'Valid', url: 'https://example.com' }
      ];
      const result = filterValidLinks(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Valid',
        url: 'https://example.com'
      });
    });

    it('should filter out malformed URLs', () => {
      const input = [
        { name: 'Valid', url: 'https://docs.nersc.gov' },
        { name: 'Relative', url: '/services/jupyter' }
      ];
      const result = filterValidLinks(input);
      expect(result).toHaveLength(2);
      expect(result.map(r => r.name)).toEqual(['Valid', 'Relative']);
    });

    it('should support custom translator function', () => {
      const input = [{ name: 'Docs', url: 'https://docs.nersc.gov' }];
      const translator = (s: string) => `Translated ${s}`;
      const result = filterValidLinks(input, translator);
      expect(result[0].name).toBe('Translated Docs');
    });
  });

  describe('isMixedContent', () => {
    it('should flag http URL on https page as mixed content', () => {
      expect(isMixedContent('http://example.com', 'https:')).toBe(true);
    });

    it('should allow https URL on https page', () => {
      expect(isMixedContent('https://example.com', 'https:')).toBe(false);
    });

    it('should allow http URL on http page', () => {
      expect(isMixedContent('http://example.com', 'http:')).toBe(false);
    });
  });

  describe('newHelpResourceWidget', () => {
    it('should create a MainAreaWidget with an IFrame content', () => {
      const widget = newHelpResourceWidget(
        'NERSC Docs',
        'https://docs.nersc.gov',
        'test-namespace',
        0
      );

      expect(widget).toBeDefined();
      expect(widget.title.label).toBe('NERSC Docs');
      expect(widget.content.url).toBe('https://docs.nersc.gov');
      expect(widget.content.id).toBe('test-namespace-0');
      expect(widget.hasClass(CSS_CLASS)).toBe(true);
      expect(widget.content.hasClass(CSS_CLASS)).toBe(true);
    });
  });
});
