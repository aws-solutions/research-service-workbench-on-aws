describe('datasets delete negative tests', () => {
  describe('when the dataset does not exist', () => {
    test('it returns a 404', () => {});
  });

  describe('when there are non-deleted', () => {
    describe('external endpoints', () => {
      test('it returns a 409', () => {});
    });

    describe('associated projects', () => {
      test('it returns a 409', () => {});
    });
  });
});
