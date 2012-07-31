describe('lib/parser.js', function() {
  var parser = require('../../src/lib/parser');

  describe('line', function() {
    it('handles cast and title', function() {
      var result = parser.line('Aaron, Caroline\t\t2000 Blockbuster Entertainment Awards (2000) (TV)  [Herself]');
      expect(result.cast).toBe('Aaron, Caroline');
      expect(result.title).toBe('2000 Blockbuster Entertainment Awards (2000) (TV)  [Herself]');
    });

    it('handles title only', function() {
      var result = parser.line('\t\t\t21 Jump Street (2012)  [Annie Schmidt]  <19>');
      expect(result.cast).toBeUndefined();
      expect(result.title).toBe('21 Jump Street (2012)  [Annie Schmidt]  <19>');
    });
  });

  describe('title', function() {
    it('handles a movie', function() {
      var result = parser.title('21 Jump Street (2012)  [Annie Schmidt]  <19>');
      expect(result.title).toBe('21 Jump Street\t2012\tMovie');
      expect(result.name).toBe('21 Jump Street');
      expect(result.year).toBe('2012');
      expect(result.type).toBe('Movie');
    });

    it('handles a tv movie', function() {
      var result = parser.title('Dad, the Angel & Me (1995) (TV)  [Abby]  <9>');
      expect(result.title).toBe('Dad, the Angel & Me\t1995\tTV Movie');
      expect(result.name).toBe('Dad, the Angel & Me');
      expect(result.year).toBe('1995');
      expect(result.type).toBe('TV Movie');
    });

    it('handles tv show', function() {
      var result = parser.title('"Curb Your Enthusiasm" (2000) {Chet\'s Shirt (#3.1)}  [Barbara]  <6>');
      expect(result.title).toBe('Curb Your Enthusiasm\t2000\tTV Show');
      expect(result.name).toBe('Curb Your Enthusiasm');
      expect(result.year).toBe('2000');
      expect(result.type).toBe('TV Show');
    });

    it('handles suspended tv movie', function() {
      var result = parser.title('Rock da Boat (2001) (TV) {{SUSPENDED}}  [Herself]  <1>');
      expect(result.title).toBe('Rock da Boat\t2001\tTV Movie');
      expect(result.name).toBe('Rock da Boat');
      expect(result.year).toBe('2001');
      expect(result.type).toBe('TV Movie');
    });

    it('handles suspended tv show', function() {
      var result = parser.title('"Right to Left" (2008) {Change Is Coming (#1.2)} {{SUSPENDED}}  [Rico]');
      expect(result.title).toBe('Right to Left\t2008\tTV Show');
      expect(result.name).toBe('Right to Left');
      expect(result.year).toBe('2008');
      expect(result.type).toBe('TV Show');
    });

    it('handles video', function() {
      var result = parser.title('The Burly Man Chronicles (2004) (V)  (archive footage)  [Herself (extended version)]');
      expect(result.title).toBe('The Burly Man Chronicles\t2004\tVideo');
      expect(result.name).toBe('The Burly Man Chronicles');
      expect(result.year).toBe('2004');
      expect(result.type).toBe('Video');
    });

    it('handles missing year', function() {
      var result = parser.title('Nailed (????)  [Reporter]');
      expect(result.title).toBe('Nailed\t????\tMovie');
      expect(result.name).toBe('Nailed');
      expect(result.year).toBe('????');
      expect(result.type).toBe('Movie');
    });

    it('handles odd title', function() {
      var result = parser.title(') ( (2008)  [Ella]');
      expect(result.title).toBe(') (\t2008\tMovie');
      expect(result.name).toBe(') (');
      expect(result.year).toBe('2008');
      expect(result.type).toBe('Movie');
    });

    it('handles year with extension', function() {
      var result = parser.title('The Closet (2011/II)  [Mom]');
      expect(result.title).toBe('The Closet\t2011/II\tMovie');
      expect(result.name).toBe('The Closet');
      expect(result.year).toBe('2011/II');
      expect(result.type).toBe('Movie');
    });

    it('handles additional spaces', function() {
      var result = parser.title('Dear John,  (2007)  [Sam Armstrong]');
      expect(result.title).toBe('Dear John, \t2007\tMovie');
      expect(result.name).toBe('Dear John, ');
      expect(result.year).toBe('2007');
      expect(result.type).toBe('Movie');
      expect(result.episode).toBeUndefined();
    });

    it('handles many notes', function() {
      var result = parser.title('"The Beatles Anthology" (1995) {July \'40 to March \'63 (#1.1)}  (archive footage) (uncredited)  [Himself]');
      expect(result.title).toBe('The Beatles Anthology\t1995\tTV Show');
      expect(result.name).toBe('The Beatles Anthology');
      expect(result.year).toBe('1995');
      expect(result.type).toBe('TV Show');
    });

    it('handles nested stuff', function() {
      var result = parser.title('"Knevel & van den Brink" (2007) {(#4.21)}  [Himself - CDA Prominent [sic]]  <4>');
      expect(result.title).toBe('Knevel & van den Brink\t2007\tTV Show');
      expect(result.name).toBe('Knevel & van den Brink');
      expect(result.year).toBe('2007');
      expect(result.type).toBe('TV Show');
    });

    it('handles multiple years', function() {
      var result = parser.title('"Idol - Jakten på en superstjerne" (2003)  [Second place (2005)]  <40>');
      expect(result.title).toBe('Idol - Jakten på en superstjerne\t2003\tTV Show');
      expect(result.name).toBe('Idol - Jakten på en superstjerne');
      expect(result.year).toBe('2003');
      expect(result.type).toBe('TV Show');
    });
  });
});
