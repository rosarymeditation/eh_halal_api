const db = require("../config/db");

class RawQuery {
  //   whereClause(obj){

  //   }

  static async selectShops() {
    const sql = `SELECT s.id, s.shopName, s.logo, s.banner, s.firstAddress, s.notice, s.about, s.deliveryPrice, s.discountAmount, s.minOrder, s.percentageDiscount, s.longitude, s.latitude, c.name As city,  o.name As origin
      FROM "VirtualShops" s
      JOIN
      Cities c ON s.cityId = c.id
      JOIN
      Origins o ON s.originId = o.id
      WHERE s.isActive=true`;
    // const [result, _] = await db.execute(sql);

    const result = await db.query(sql);
    return result.rows;
  }

  static async selectShopById(shopId) {
    const sql = `SELECT s.id, s.shopName, s.logo, s.banner, s.firstAddress, s.notice, s.about, s.deliveryPrice, s.discountAmount, s.percentageDiscount, s.longitude, s.latitude, c.name As city,  o.name As origin
      FROM VirtualShops s
      JOIN
      Cities c ON s.cityId = c.id
      JOIN
      Origins o ON s.originId = o.id
      WHERE s.id='${shopId}'`;
    // const [result, _] = await db.execute(sql);

    const result =  db.query(sql);
    return result.rows;
  }

  static async selectProductById(shopId) {
    console.log("shop id is " + shopId);
    const sql = `SELECT p.id, p.name, p.shopId, p.systemId, p.photo, p.price, p.discountPrice, p.quantity, p.desc, p.weight, p.addOn As extra, c.name As category u.name As unit
      FROM Products p
      JOIN
      Categories c ON p.categoryId = c.id
      JOIN
      Units u ON p.unitId = u.id
      WHERE p.shopId= '${shopId}'`;
    // const [result, _] = await db.execute(sql);

    const result = await db.query(sql);
    return result.rows;
  }

  static async findCourses(
    institutionId = "e0efde4d-9619-44ac-be64-889a24d3ac0e",
    facultyId,
    degreeTypeId,
    search,
    limit,
    offset
  ) {
    // let where = `WHERE institutionId = ${institutionId} AND facultyId = ${facultyId} AND degreeTypeId = ${degreeTypeId}`;
    // if (facultyId == "") {
    //   where = `WHERE institutionId = ${institutionId} AND degreeTypeId = ${degreeTypeId}`;
    // }
    // const where = `WHERE facultyId = ${facultyId}`;
    // const where = `WHERE degreeTypeId = ${degreeTypeId}`;
    let whereObj = {};
    let count = 1;
    let whereClause;
    let like;
    if (institutionId != "") {
      whereObj.institutionId = institutionId;
    }
    if (facultyId != "") {
      whereObj.facultyId = facultyId;
    }
    if (degreeTypeId != "") {
      whereObj.degreeTypeId = degreeTypeId;
    }

    for (const [key, value] of Object.entries(whereObj)) {
      console.log(`${count} :${key}: ${value}`);
      if (count == 1) {
        whereClause = `WHERE ${key} = '${value}' `;
      } else {
        whereClause += `AND ${key} = '${value}' `;
      }
      count++;
    }

    if (search != "") {
      if (count > 1) {
        whereClause += `AND name LIKE '%${search}%'`;
      } else {
        whereClause = `WHERE name LIKE '%${search}%'`;
      }
      console.log(whereClause);
    }

    const sql2 = `SELECT c.id, c.url, c.name, c.duration, c.isPopular, c.scholarshipAmount, c.scholarshipAmount, c.fee, c.intake, c.institutionId, i.name AS uni, d.name AS degree, f.name AS faculty
      FROM (
        SELECT * FROM   Courses
        ${whereClause}
        ORDER  BY id DESC
        LIMIT  ${limit}
        OFFSET ${offset}
        ) c
      JOIN
      Institutions i ON c.institutionId = i.id
      JOIN
      DegreeTypes d ON c.degreeTypeId = d.id
      JOIN
      Faculties f ON c.facultyId = f.id`;
    // const sql = `SELECT * FROM Courses`;
    const [courses, _] = await db.execute(sql2);

    return courses;
  }
}
module.exports = RawQuery;
