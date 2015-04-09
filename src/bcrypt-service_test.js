describe('dtrw.bcrypt-service', function () {
  var bcrypt;

  beforeEach(function () {
    module('dtrw.bcrypt');

    inject(function ($injector) {
      bcrypt = $injector.get('bcrypt');
    });
  });

  describe('hashing passwords', function () {
    var testPassword = '$s0m3P@sSw0Rd';
    var salt;
    var hash;

    beforeEach(function () {
      salt = bcrypt.genSaltSync(4);
      hash = bcrypt.hashSync(testPassword, salt);
    });


    it('should correctly match passwords with hashes', function () {
      assert.ok(bcrypt.compareSync(testPassword, hash));
    });

    it('should not match invalid passwords', function () {
      assert.notOk(bcrypt.compareSync('notthepassword', hash));
    });
  });
});
