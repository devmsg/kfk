const { Controller } = think;

module.exports = class extends Controller {
  async user() {
    await this.hook.run('hook1');
    try {
      await this.models.user.sync({
        force: false
      });
      await this.models.user.create({
        name: 'userName',
        age: 12
      });

      const users = await this.models.user.findAll();
      await this.hook.run('hook2');
      this.success(users);
    } catch (error) {
      this.fail(error);
    }
  }
}