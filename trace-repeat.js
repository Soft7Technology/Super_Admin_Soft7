const originalRepeat = String.prototype.repeat;
String.prototype.repeat = function(count) {
  if (typeof count !== 'number') {
    console.error('repeat called with non-number count:', count, typeof count);
  }
  if (count < 0) {
    console.error('Invalid repeat count:', count);
    console.error(new Error('repeat stack trace').stack);
  }
  return originalRepeat.call(this, count);
};
