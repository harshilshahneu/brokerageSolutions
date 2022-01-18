import firebaseServices from '../../firebaseServices'
import verificationServices from '../../verificationServices';
export default {

    async postLocationDetails(collectionID, newdata, localityID, sublocalityID) {
        let apartment = await firebaseServices.addDocumentAutoID(collectionID, newdata).catch((err) => { console.error(err); })
        return [
            apartment['id'],
            await firebaseServices.addArrayElement('localities', localityID, collectionID, apartment['id']).catch((err) => { console.error(err); }), //update localities array
            await firebaseServices.addArrayElement('sublocalities', sublocalityID, collectionID, apartment['id']).catch((err) => { console.error(err); }), //update sublocalities array
        ]
    },

    async addNewLocality(newdata, verification_status /* depends on who is posting the property [staff=true,other=false] */) {
        let localityForm = {
            locality_name: newdata['location_details']['locality_name'],
            city: newdata['location_details']['city'],
            sublocalities: [],
            verified: verification_status
        }

        let locality = await firebaseServices.addDocumentAutoID('localities', localityForm).catch((err) => { console.error(err); }) //enter new locality
        await firebaseServices.addDocumentManualID('pending_locality_verification', locality['id'], localityForm).catch((err) => { console.error(err); }) //add locality for verification
        if (verification_status) await verificationServices.verifyLocality(locality['id'], newdata['location_details']['city'])
        return locality['id']
    },
    async addNewSubLocality(localityID, newdata, verification_status /* depends on who is posting the property [staff=true,other=false] */) {
        let sublocalityForm = {
            sublocality_name: newdata['location_details']['sublocality_name'],
            city: newdata['location_details']['city'],
            locality_id: localityID,
            locality_name: newdata['location_details']['locality_name'],
            verified: verification_status
        }

        let sublocality = await firebaseServices.addDocumentAutoID('sublocalities', sublocalityForm).catch((err) => { console.error(err); }) //enter new sublocality
        await firebaseServices.addDocumentManualID('pending_sublocality_verification', sublocality['id'], sublocalityForm).catch((err) => { console.error(err); }) //enter new sublocality
        if (verification_status) await verificationServices.verifySublocality(sublocality['id'], localityID)
        return sublocality['id'];
    },
    async addNewBuilding(localityID, sublocalityID, newdata, verification_status /* depends on who is posting the property [staff=true,other=false] */) {
        let buildingData = {
            building_name: newdata['location_details']['building_name'],
            city: newdata['location_details']['city'],
            locality_id: localityID,
            locality_name: newdata['location_details']['locality_name'],
            sublocality_id: sublocalityID,
            sublocality_name: newdata['location_details']['sublocality_name'],
            landmark: newdata['location_details']['landmark'],
            verified: verification_status,
        }

        //adding new building
        let building = await firebaseServices.addDocumentAutoID('buildings', buildingData).catch((err) => { console.error(err); }) //enter new building
        await firebaseServices.addDocumentManualID('pending_building_verification', building['id'], buildingData).catch((err) => { console.error(err); }) //enter new building
        if (verification_status) await verificationServices.verifyBuilding(building['id'], sublocalityID)
        return building['id']
    },

    async updateLocalityID(collectionID, apartmentID, localityID) {
        return await this.updateApartmentDetails(collectionID, apartmentID, { location_details: { locality_id: localityID } }).catch((err) => { console.error(err); })
    },
    async updateSublocalityID(collectionID, apartmentID, sublocalityID) {
        return await this.updateApartmentDetails(collectionID, apartmentID, { location_details: { sublocality_id: sublocalityID } }).catch((err) => { console.error(err); })
    },
    async updateBuildingID(collectionID, apartmentID, buildingID) {
        return await this.updateApartmentDetails(collectionID, apartmentID, { location_details: { building_id: buildingID } })
    },

    async postConstructionDetails(collectionID, apartmentID, buildingID, newdata) {
        // let buildingData = {
        //     construction_type: newdata['construction_details']['construction_type'],
        //     possesion_date: newdata['construction_details']['possesion_date'],
        //     oc_status: newdata['construction_details']['oc_status'],
        //     property_age: newdata['construction_details']['property_age'],
        // }
        this.updateApartmentDetails(collectionID, apartmentID, newdata)
        // this.updateBuildingDetails(buildingID, buildingData)
    },

    async postPropertyDetails(collectionID, apartmentID, newdata) {
        this.updateApartmentDetails(collectionID, apartmentID, newdata)
    },

    async postPricingDetails(collectionID, apartmentID, flatID, newdata) {
        this.updateApartmentDetails(collectionID, apartmentID, newdata)
        let maintenanceData = {
            monthly_maintainence: newdata['monthly_maintainence'],
            annual_maintainence: newdata['annual_maintenance']
        }
        this.updateFlatDetails(collectionID, documentID, flatID, maintenanceData)
    },

    async postRentalDetails(collectionID, apartmentID, flatID, newdata) {
        this.updateApartmentDetails(collectionID, apartmentID, newdata)
        let maintenanceData = {
            monthly_maintainence: newdata['monthly_maintainence'],
            annual_maintainence: newdata['annual_maintenance']
        }
        this.updateFlatDetails(collectionID, documentID, flatID, maintenanceData)
    },

    async postAmenitiesDetails(collectionID, apartmentID, newdata) {
        this.updateApartmentDetails(collectionID, apartmentID, newdata)
        this.updateBuildingDetails(buildingID, newdata)
    },

    async postVisitPreferenceDetails(collectionID, apartmentID, newdata) {
        this.updateApartmentDetails(collectionID, apartmentID, newdata)
        let flatData = {
            BHKtype: newdata['location_details']['city'],
            carpet_area: newdata['location_details']['city'],
            builtup_area: newdata['location_details']['city'],
            super_builtup_area: newdata['location_details']['city'],
            total_floors: newdata['location_details']['city'],
            facing: newdata['location_details']['city'],
            bathrooms: newdata['location_details']['city'],
            balconies: newdata['location_details']['city'],
            "monthly_maintainence": "5000/month",
            "annual_maintainence": "70000/year"
        }
        await firebaseServices.addArrayElement('buildings', buildingID, 'flats', flatData) //update flats array
    },

    async postOtherDetails(collectionID, apartmentID, newdata) {
        this.updateApartmentDetails(collectionID, apartmentID, newdata)
    },

    async updateApartmentDetails(collectionID, apartmentID, newdata) {
        try {
            return await firebaseServices.updateSingleDocument(collectionID, apartmentID, newdata) //update property
        } catch (error) { console.error(error); return error }
    },

    async addNewFlat(collectionID, apartmentID, flatData) {
        let flatDataBody = {
            BHKtype: flatData['BHKtype'],
            carpet_area: flatData['carpet_area'],
            builtup_area: flatData['builtup_area'],
            super_builtup_area: flatData['super_builtup_area'],
            total_floors: flatData['total_floors'],
            facing: flatData['facing'],
            bathrooms: flatData['bathrooms'],
            balconies: flatData['balconies'],
        }
        this.updateApartmentDetails(collectionID, apartmentID, { total_floors: flatData['total_floors'] })
        let flat = firebaseServices.addDocumentAutoIDNestedCollection(collectionID, apartmentID, 'flats', flatDataBody)
        this.updateFlatDetails(collectionID, documentID, flat['id'], { flat_id: flat['id'] })
    },
    async updateFlatDetails(collectionID, documentID, flatID, flatData) {
        firebaseServices.updateSingleNestedDocument(collectionID, documentID, 'flats', flatID, flatData)
    },

    async updateBuildingDetails(buildingID, newdata) {
        try {
            return await firebaseServices.updateSingleDocument('buildings', buildingID, newdata) //update property
        } catch (error) { console.error(error); return error }
    },

    async postMedia(collectionID, apartmentID, file, metadata, image_path) {
        try {
            return [
                await firebaseServices.setSingleMedia(image_path, file), //update property
                await firebaseServices.addArrayElement(collectionID, apartmentID, 'media', metadata['media'][0]), //update media array
            ]
        } catch (error) { console.error(error); return error }
    },

    async getLocalities(cityID) {
        try {
            return await firebaseServices.doubleEqualsQuery('localities', 'city', cityID, 'verified', true)
        } catch (error) { console.error(error); return error }
    },

    async getSublocalities(localityID) {
        try {
            return await firebaseServices.doubleEqualsQuery('sublocalities', 'locality_id', localityID, 'verified', true)
        } catch (error) { console.error(error); return error }
    },

    async getBuildings(sublocalityID) {
        try {
            return await firebaseServices.doubleEqualsQuery('buildings', 'sublocality_id', sublocalityID, 'verified', true)
        } catch (error) { console.error(error); return error }
    }
}