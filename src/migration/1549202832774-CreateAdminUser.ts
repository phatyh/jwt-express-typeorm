import { MigrationInterface, QueryRunner, getRepository } from "typeorm";
import { User } from "../entity";

export class CreateAdminUser1547919837483 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    let user = new User();
    user.username = "admin";
    user.password = "admin";
    user.hashPassword();
    user.role = "ADMIN";
    user.email = "phpapp@hotmail.com";
    user.firstname = 'Fatih';
    user.lastname = 'Turan';
    const userRepository = getRepository(User);
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
